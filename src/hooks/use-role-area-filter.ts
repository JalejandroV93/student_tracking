import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@/prismacl/client";

// Definir los tipos de elemento que pueden filtrarse
interface Filterable {
  nivel?: string | null;
  area?: string | null;
  section?: string | null;
}

// Mapeo de roles a áreas permitidas
const roleToAreaPermissions: Record<Role, string[]> = {
  [Role.ADMIN]: ["PRESCHOOL", "ELEMENTARY", "MIDDLE", "HIGH"],
  [Role.PRESCHOOL_COORDINATOR]: ["PRESCHOOL"],
  [Role.ELEMENTARY_COORDINATOR]: ["ELEMENTARY"],
  [Role.MIDDLE_SCHOOL_COORDINATOR]: ["MIDDLE"],
  [Role.HIGH_SCHOOL_COORDINATOR]: ["HIGH"],
  [Role.PSYCHOLOGY]: ["PRESCHOOL", "ELEMENTARY", "MIDDLE", "HIGH"],
  [Role.TEACHER]: [], // Los profesores solo ven su grupo específico
  [Role.USER]: [],
  [Role.STUDENT]: [],
};

// Mapeo de códigos de área a valores en los datos
const areaCodeToDataValue: Record<string, string[]> = {
  PRESCHOOL: ["Preescolar", "preschool", "preescolar"],
  ELEMENTARY: ["Primaria", "elementary", "primaria"],
  MIDDLE: ["Secundaria", "middle", "secundaria"],
  HIGH: ["Bachillerato", "high", "bachillerato"],
};

export function useRoleAreaFilter() {
  const { user } = useAuth();

  // Función para verificar si el usuario tiene permiso para ver un área específica
  const canViewArea = (areaCode: string): boolean => {
    if (!user) return false;

    // Administradores pueden ver todo
    if (user.role === Role.ADMIN) return true;

    // Verificar permisos basados en el rol
    const allowedAreas = roleToAreaPermissions[user.role] || [];
    return allowedAreas.includes(areaCode);
  };

  // Función para filtrar una lista de elementos según el rol y permisos del usuario
  const filterByRole = <T extends Filterable>(items: T[]): T[] => {
    if (!user) return [];

    // Administradores pueden ver todo
    if (user.role === Role.ADMIN) return items;

    // Obtener áreas permitidas para el rol
    const allowedAreas = roleToAreaPermissions[user.role] || [];

    // Filtrar los elementos por área
    return items.filter((item) => {
      // Determinar el valor de área/nivel/sección del elemento
      const itemArea = item.nivel || item.area || item.section || "";

      // Verificar si el ítem pertenece a alguna de las áreas permitidas
      return allowedAreas.some((areaCode) => {
        const validValues = areaCodeToDataValue[areaCode] || [];
        return validValues.some(
          (value) => itemArea.toLowerCase() === value.toLowerCase()
        );
      });
    });
  };

  // Función para obtener el área del usuario según su rol
  const getUserArea = (): string => {
    if (!user) return "";

    // Administradores no tienen área específica
    if (user.role === Role.ADMIN) return "";

    // Mapear rol a área
    switch (user.role) {
      case Role.PRESCHOOL_COORDINATOR:
        return "Preescolar";
      case Role.ELEMENTARY_COORDINATOR:
        return "Primaria";
      case Role.MIDDLE_SCHOOL_COORDINATOR:
        return "Secundaria";
      case Role.HIGH_SCHOOL_COORDINATOR:
        return "Bachillerato";
      case Role.TEACHER:
        // Los profesores tienen un grupo específico, no un área general
        return "";
      default:
        return "";
    }
  };

  return {
    canViewArea,
    filterByRole,
    getUserArea,
    isAdmin: user?.role === Role.ADMIN,
    userRole: user?.role,
  };
}
