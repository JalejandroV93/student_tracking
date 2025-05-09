import { UserPayload } from "@/types/user";
import { Role } from "@prisma/client";
import { AlertTriangle, CalendarDays, LayoutGrid, LucideIcon, Settings, Users } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

// Función para filtrar submenús por área según rol
const filterSubmenusByRole = (
  submenus: Submenu[] | undefined,
  user: UserPayload | null
): Submenu[] | undefined => {
  if (!submenus) return undefined;
  if (!user) return submenus;

  // Admin puede ver todo
  if (user.role === Role.ADMIN) return submenus;

  // Filtrar según el rol
  return submenus.filter((submenu) => {
    // Si es "Todas las secciones", no mostrar excepto para ADMIN
    if (submenu.label === "Todas las secciones") {
      return user.role === Role.ADMIN;
    }

    // Filtrar por área según rol
    switch (user.role) {
      case Role.PRESCHOOL_COORDINATOR:
        return submenu.href.includes("preschool");
      case Role.ELEMENTARY_COORDINATOR:
        return submenu.href.includes("elementary");
      case Role.MIDDLE_SCHOOL_COORDINATOR:
        return submenu.href.includes("middle");
      case Role.HIGH_SCHOOL_COORDINATOR:
        return submenu.href.includes("high");
      case Role.PSYCHOLOGY:
        // Psicología tiene acceso a todas las áreas específicas pero no a "Todas las secciones"
        return (
          submenu.href.includes("preschool") ||
          submenu.href.includes("elementary") ||
          submenu.href.includes("middle") ||
          submenu.href.includes("high")
        );
      default:
        return true;
    }
  });
};

export function getMenuList(
  pathname: string,
  user: UserPayload | null = null
): Group[] {
  // Base del menú
  const menuList: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Resumen",
          icon: LayoutGrid,
          active: pathname === "/dashboard",
        },
      ],
    },
    {
      groupLabel: "Gestión",
      menus: [
        {
          href: "",
          label: "Alertas",
          icon: AlertTriangle,
          active: pathname.startsWith("/dashboard/alerts"),
          submenus: [
            {
              href: "/dashboard/alerts",
              label: "Todas las secciones",
            },
            {
              href: "/dashboard/alerts/preschool",
              label: "Preescolar",
            },
            {
              href: "/dashboard/alerts/elementary",
              label: "Primaria",
            },
            {
              href: "/dashboard/alerts/middle",
              label: "Secundaria",
            },
            {
              href: "/dashboard/alerts/high",
              label: "Bachillerato",
            },
          ],
        },
        {
          href: "/dashboard/students",
          label: "Estudiantes",
          icon: Users,
          active: pathname.startsWith("/dashboard/students"),
        },
        {
          href: "",
          label: "Gestión de Casos",
          icon: CalendarDays,
          active: pathname.startsWith("/dashboard/case-management"),
          submenus: [
            {
              href: "/dashboard/case-management",
              label: "Todas las secciones",
            },
            {
              href: "/dashboard/case-management/preschool",
              label: "Preescolar",
            },
            {
              href: "/dashboard/case-management/elementary",
              label: "Primaria",
            },
            {
              href: "/dashboard/case-management/middle",
              label: "Secundaria",
            },
            {
              href: "/dashboard/case-management/high",
              label: "Bachillerato",
            },
          ],
        },
      ],
    },
  ];

  // Agregar sección de configuración solo para administradores
  if (!user || user.role === Role.ADMIN) {
    menuList.push({
      groupLabel: "Configuración",
      menus: [
        {
          href: "",
          label: "Configuración",
          icon: Settings,
          active: pathname.startsWith("/dashboard/settings"),
          submenus: [
            {
              href: "/dashboard/settings",
              label: "Alertas",
            },
            {
              href: "/dashboard/settings/users",
              label: "Usuarios",
            },
          ],
        },
      ],
    });
  }

  // Filtrar submenús según el rol del usuario
  return menuList
    .map((group) => ({
      ...group,
      menus: group.menus
        .map((menu) => ({
          ...menu,
          submenus: filterSubmenusByRole(menu.submenus, user),
        }))
        .filter((menu) => !menu.submenus || menu.submenus.length > 0), // Filtrar menús sin submenús
    }))
    .filter((group) => group.menus.length > 0); // Filtrar grupos sin menús
}
