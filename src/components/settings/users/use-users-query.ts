import { useQuery } from "@tanstack/react-query";
import { UsersResponse } from "./types";

interface UseUsersQueryParams {
  page: number;
  search: string;
  showBlockedOnly: boolean;
  limit?: number;
}

export function useUsersQuery({
  page,
  search,
  showBlockedOnly,
  limit = 10,
}: UseUsersQueryParams) {
  return useQuery({
    queryKey: ["users", page, search, showBlockedOnly],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (showBlockedOnly) params.append("blocked", "true");

      const response = await fetch(`/api/v1/users?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
  });
}
