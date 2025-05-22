import { UserPayload } from "@/types/user";
import { Role } from "@prisma/client";
import {
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  LucideIcon,
  Users,
  Database,
  Settings, // Added Settings icon
  ShieldCheck, // Added ShieldCheck icon for user permissions
  BookMarked, // Added BookMarked icon for areas
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

const generateAreaSubmenus = (
  basePath: string,
  user: UserPayload | null
): Submenu[] => {
  const newSubmenus: Submenu[] = [];

  if (user) {
    if (user.role === Role.ADMIN || user.role === Role.PSYCHOLOGY) {
      newSubmenus.push({
        href: basePath, // Main path for "Todas las secciones"
        label: "Todas las secciones",
        active: false, // Active state will be handled by parent menu or specific logic if needed
      });
    } else if (user.AreaPermissions) {
      user.AreaPermissions.forEach((permission) => {
        if (permission.canView && permission.area) {
          newSubmenus.push({
            href: `${basePath}/${permission.area.code.toLowerCase()}`,
            label: permission.area.name,
            active: false, // Active state handled by parent
          });
        }
      });
      // Sort by label alphabetically
      newSubmenus.sort((a, b) => a.label.localeCompare(b.label));
    }
  }
  return newSubmenus;
};


export function getMenuList(
  pathname: string,
  user: UserPayload | null = null
): Group[] {
  let initialMenuList: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Inicio",
          icon: LayoutGrid,
          active: pathname === "/dashboard",
        },
      ],
    },
    {
      groupLabel: "Gestión",
      menus: [
        {
          href: "/dashboard/alerts", // Main link for Alertas
          label: "Alertas",
          icon: AlertTriangle,
          active: pathname.startsWith("/dashboard/alerts"),
          submenus: generateAreaSubmenus("/dashboard/alerts", user),
        },
        {
          href: "/dashboard/students",
          label: "Estudiantes",
          icon: Users,
          active: pathname.startsWith("/dashboard/students"),
        },
        {
          href: "/dashboard/case-management", // Main link for Case Management
          label: "Gestión de Casos",
          icon: CalendarDays,
          active: pathname.startsWith("/dashboard/case-management"),
          submenus: generateAreaSubmenus("/dashboard/case-management", user),
        },
      ],
    },
  ];

  // Add settings group only for ADMIN
  if (user && user.role === Role.ADMIN) {
    initialMenuList.push({
      groupLabel: "Configuración",
      menus: [
        {
          href: "/dashboard/settings/alerts",
          label: "Configuración Alertas", // More specific label
          icon: Settings, 
          active: pathname.startsWith("/dashboard/settings/alerts"),
        },
        {
          href: "/dashboard/settings/users", // Original "Usuarios" link
          label: "Usuarios",
          icon: Users,
          active: pathname.startsWith("/dashboard/settings/users"),
        },
        { // New "Permisos de Usuario" link
          href: "/dashboard/settings/user-permissions",
          label: "Permisos por Área",
          icon: ShieldCheck,
          active: pathname.startsWith("/dashboard/settings/user-permissions"),
        },
        { // New "Áreas" link
          href: "/dashboard/settings/areas",
          label: "Áreas",
          icon: BookMarked,
          active: pathname.startsWith("/dashboard/settings/areas"),
        },
        {
          href: "/dashboard/admin/sync",
          label: "Sincronización BD",
          icon: Database,
          active: pathname.startsWith("/dashboard/admin/sync"),
        },
      ],
    });
  }

  // Filter menus and groups:
  // 1. Map over groups
  // 2. For each group, map over its menus
  // 3. For each menu, set its 'active' state if a submenu is active
  // 4. Filter out menus that have an empty submenus array (unless they are direct links like /dashboard/students)
  // 5. Filter out groups that have no menus left
  return initialMenuList
    .map((group) => {
      const filteredMenus = group.menus
        .map((menu) => {
          // Update active state for parent menu if any submenu is active
          if (menu.submenus && menu.submenus.length > 0) {
            menu.active = menu.submenus.some(submenu => pathname === submenu.href || pathname.startsWith(submenu.href + '/'));
            // If no submenu is active, the parent menu's active status is determined by its own href
            if(!menu.active){
                 menu.active = pathname.startsWith(menu.href) && menu.href !== "" && menu.href !== "/dashboard"; 
                 // for /dashboard, active is only true if pathname IS /dashboard exactly
                 if(menu.href === "/dashboard") menu.active = pathname === "/dashboard";
            }
          } else {
            // For menus without submenus, active state is based on their own href
             menu.active = pathname.startsWith(menu.href) && menu.href !== "" && menu.href !== "/dashboard";
             if(menu.href === "/dashboard") menu.active = pathname === "/dashboard";
          }
          
          // Assign submenus, ensuring it's undefined if empty, for the filter below
          const submenus = menu.submenus && menu.submenus.length > 0 ? menu.submenus.map(sm => ({...sm, active: pathname === sm.href})) : undefined;
          
          return { ...menu, submenus };
        })
        .filter((menu) => {
          // Keep menu if it's a direct link (no submenus defined or originally empty)
          // OR if it has submenus after dynamic generation.
          // The original static definition had href:"" for parents with submenus. We now use the base path.
          return menu.href !== "" || (menu.submenus && menu.submenus.length > 0);
        });
      
      return { ...group, menus: filteredMenus };
    })
    .filter((group) => group.menus.length > 0);
}
