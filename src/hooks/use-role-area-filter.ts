import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@prisma/client"; // Ensure Role is imported

// Definir los tipos de elemento que pueden filtrarse
interface Filterable {
  nivel?: string | null;
  area?: string | null;
  section?: string | null;
}

export function useRoleAreaFilter() {
  const { user } = useAuth();
  const areaPermissions = user?.AreaPermissions;
  const userRole = user?.role;

  // Función para verificar si el usuario tiene permiso para ver un área específica por CÓDIGO de área
  const canViewArea = (areaCode: string): boolean => {
    if (!user) return false; 
    if (userRole === Role.ADMIN) return true;
    if (!areaPermissions) return false;
    // Check against area.code
    return areaPermissions.some(p => p.area.code.toLowerCase() === areaCode.toLowerCase() && p.canView);
  };

  // Función para filtrar una lista de elementos según el rol y permisos del usuario
  // Esta función ahora compara contra area.name
  const filterByRole = <T extends Filterable>(items: T[]): T[] => {
    if (!user) return []; 
    if (userRole === Role.ADMIN) return items;
    if (!areaPermissions) return [];

    const viewableAreaNames = new Set(
      areaPermissions
        .filter(p => p.canView)
        .map(p => p.area.name.toLowerCase()) // Compare with area.name
    );

    return items.filter(item => {
      const itemAreaValue = item.nivel || item.area || item.section;
      if (!itemAreaValue) return false;
      return viewableAreaNames.has(itemAreaValue.toLowerCase());
    });
  };

  // Función para obtener los NOMBRES de las áreas permitidas para el usuario
  const getUserArea = (): string[] => {
    if (!user) return []; 
    // For ADMIN, returning all area names would require fetching all areas here or having them passed.
    // For now, returning an empty array; client logic should understand ADMIN means all access.
    if (userRole === Role.ADMIN) return []; 
    if (!areaPermissions) return [];
    return areaPermissions.filter(p => p.canView).map(p => p.area.name);
  };

  return {
    canViewArea,
    filterByRole,
    getUserArea, // Note: return type changed to string[]
    isAdmin: userRole === Role.ADMIN,
    userRole: userRole, // Export userRole
    // Optionally export filtered permissions if direct access is needed by UI components
    viewableAreaPermissions: areaPermissions?.filter(p => p.canView) || [] 
  };
}
