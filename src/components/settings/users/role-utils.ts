import { Role } from "@/prismacl/client";

export const getRoleBadgeColor = (role: Role): string => {
  switch (role) {
    case "ADMIN":
      return "bg-red-500";
    case "PRESCHOOL_COORDINATOR":
      return "bg-blue-500";
    case "ELEMENTARY_COORDINATOR":
      return "bg-green-500";
    case "MIDDLE_SCHOOL_COORDINATOR":
      return "bg-yellow-500";
    case "HIGH_SCHOOL_COORDINATOR":
      return "bg-purple-500";
    case "PSYCHOLOGY":
      return "bg-pink-500";
    case "TEACHER":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

export const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "PRESCHOOL_COORDINATOR":
      return "Coordinador Preescolar";
    case "ELEMENTARY_COORDINATOR":
      return "Coordinador Primaria";
    case "MIDDLE_SCHOOL_COORDINATOR":
      return "Coordinador Secundaria";
    case "HIGH_SCHOOL_COORDINATOR":
      return "Coordinador Bachillerato";
    case "PSYCHOLOGY":
      return "Psicología";
    case "TEACHER":
      return "Director de Grupo";
    case "USER":
      return "Usuario";
    case "STUDENT":
      return "Estudiante";
    default:
      return role;
  }
};
