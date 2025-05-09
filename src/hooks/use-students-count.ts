import { useQuery } from "@tanstack/react-query";
import { fetchStudentCount } from "@/lib/apiClient";

export function useStudentsCount() {
  return useQuery({
    queryKey: ["studentsCount"],
    queryFn: fetchStudentCount,
    // Mantener el conteo en caché por más tiempo ya que no cambia frecuentemente
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
