// src/app/dashboard/students/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { StudentSearchList } from "@/components/students/StudentSearchList";
import { UserRoleInfo } from "@/components/students/UserRoleInfo";
import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchStudentsInfinite } from "@/lib/apiClient";
import type { Student } from "@/types/dashboard";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useDebounce } from "@/hooks/useDebounce";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

export default function StudentsListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyWithInfractions, setOnlyWithInfractions] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["students-infinite", debouncedSearchQuery, onlyWithInfractions],
    queryFn: ({ pageParam = 1 }) =>
      fetchStudentsInfinite({
        pageParam,
        limit: 20,
        search: debouncedSearchQuery,
        includeStats: true,
        onlyWithInfractions: onlyWithInfractions,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Refetch when the search query changes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single array of students
  const allStudents = useMemo(() => {
    try {
      if (!data?.pages) {
        return [];
      }

      const students = data.pages.flatMap((page) => {
        // Verificar que page.data sea un array antes de retornarlo
        if (!Array.isArray(page.data)) {
          console.error("page.data is not an array:", page.data);
          return [];
        }

        return page.data;
      });

      return students;
    } catch (error) {
      console.error("Error processing pages:", error);
      return [];
    }
  }, [data?.pages]);

  // Obtener información de paginación de la primera página
  const paginationInfo = useMemo(() => {
    const firstPage = data?.pages[0];
    if (!firstPage) return null;

    return {
      totalCount: firstPage.pagination.totalCount,
      totalPages: firstPage.pagination.totalPages,
      currentlyShowing: allStudents.length,
    };
  }, [data?.pages, allStudents.length]);

  const handleSelectStudent = (student: Student) => {
    router.push(`/dashboard/students/${student.id}`);
  };

  return (
    <ContentLayout title="Buscar Estudiantes">
      <BreadcrumbNav />
      {process.env.NODE_ENV === "development" && (
      <UserRoleInfo />)}
      <StudentSearchList
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        students={Array.isArray(allStudents) ? allStudents : []}
        onSelectStudent={handleSelectStudent}
        isLoading={isLoading}
        error={error?.message ?? null}
        isFetching={isFetching}
        // Propiedades adicionales para infinite scroll
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        // Propiedades para el filtro de faltas
        onlyWithInfractions={onlyWithInfractions}
        onOnlyWithInfractionsChange={setOnlyWithInfractions}
      />
      <div>
        {paginationInfo && (
          <p className="text-xs text-muted-foreground mt-1">
            Mostrando {paginationInfo.currentlyShowing} de{" "}
            {paginationInfo.totalCount} estudiantes
            {debouncedSearchQuery &&
              ` (filtrados por "${debouncedSearchQuery}")`}
            {onlyWithInfractions && " con faltas"}
          </p>
        )}
      </div>
    </ContentLayout>
  );
}
