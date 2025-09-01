// src/components/students/StudentSchoolYearFilter.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";

interface StudentSchoolYearFilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function StudentSchoolYearFilter({
  selectedYear,
  onYearChange,
}: StudentSchoolYearFilterProps) {
  const { activeSchoolYear, allSchoolYears, isLoading } = useDashboardFilters();

  if (isLoading) {
    return <div className="w-[200px] h-10 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Año académico:</span>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar año" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">
            <div className="flex items-center gap-2">
              <span>Activo</span>
              <Badge variant="secondary" className="text-xs">
                {activeSchoolYear?.name || "N/A"}
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="all">Todos los años</SelectItem>
          {allSchoolYears
            .filter((year) => !year.isActive) // Evitar duplicar el año activo
            .sort((a, b) => b.name.localeCompare(a.name))
            .map((year) => (
              <SelectItem key={year.id} value={year.id.toString()}>
                {year.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
