import {
  AlertTriangle,
  Users,
  Settings,
  
  LayoutGrid,
  CalendarDays,
  LucideIcon,
} from "lucide-react";

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

export function getMenuList(pathname: string): Group[] {
  return [
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
    {
      groupLabel: "Configuración",
      menus: [
        {
          href: "/dashboard/settings",
          label: "Configuración",
          icon: Settings,
          active: pathname.startsWith("/dashboard/settings"),
        },
      ],
    },
  ];
}
