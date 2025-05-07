// src/components/dashboard/DashboardSidebar.tsx
"use client";

import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Cog,
  FileText,
  Home,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Role } from "@prisma/client";

// Secciones académicas
const sections = [
  { id: "preschool", name: "Preescolar", areaCode: "PRESCHOOL" },
  { id: "elementary", name: "Primaria", areaCode: "ELEMENTARY" },
  { id: "middle", name: "Secundaria", areaCode: "MIDDLE" },
  { id: "high", name: "Bachillerato", areaCode: "HIGH" },
];

// Tipo para usuario con permisos
type UserWithPermissions = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  permissions: { [areaCode: string]: boolean };
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({
    alerts: false,
    students: false,
    cases: false,
  });

  // Obtener usuario actual y sus permisos
  const { data: currentUser, isLoading: userLoading } =
    useQuery<UserWithPermissions>({
      queryKey: ["currentUserWithPermissions"],
      queryFn: async () => {
        const response = await fetch("/api/v1/auth/me?includePermissions=true");
        if (!response.ok) throw new Error("Error al obtener usuario");
        return response.json();
      },
    });

  // Expandir el menú activo automáticamente
  useEffect(() => {
    if (pathname.startsWith("/dashboard/alerts")) {
      setExpandedMenus((prev) => ({ ...prev, alerts: true }));
    } else if (pathname.startsWith("/dashboard/students")) {
      setExpandedMenus((prev) => ({ ...prev, students: true }));
    } else if (pathname.startsWith("/dashboard/case-management")) {
      setExpandedMenus((prev) => ({ ...prev, cases: true }));
    }
  }, [pathname]);

  // Funciones útiles
  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu as keyof typeof prev],
    }));
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isSubMenuActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Función para verificar permisos de área
  const hasPermission = (areaCode: string): boolean => {
    // Administrador siempre tiene acceso
    if (currentUser?.role === "ADMIN") return true;

    // Verificar permisos específicos
    return currentUser?.permissions?.[areaCode] || false;
  };

  // Filtrar secciones según permisos
  const filteredSections = sections.filter((section) =>
    hasPermission(section.areaCode)
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <Link href="/dashboard">
            <h1 className="text-xl font-semibold">Student Tracking</h1>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard Link */}
          <SidebarMenuItem>
            <Link href="/dashboard" passHref legacyBehavior>
              <SidebarMenuButton
                variant={isActive("/dashboard") ? "primary" : "default"}
              >
                <Home className="h-5 w-5" />
                <span>Resumen</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Alerts Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleMenu("alerts")}
              variant={
                isSubMenuActive("/dashboard/alerts") ? "secondary" : "default"
              }
            >
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.alerts ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.alerts && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/alerts" passHref legacyBehavior>
                  <SidebarMenuSubButton
                    variant={
                      isActive("/dashboard/alerts") ? "secondary" : "default"
                    }
                  >
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {filteredSections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link
                    href={`/dashboard/alerts/${section.id}`}
                    passHref
                    legacyBehavior
                  >
                    <SidebarMenuSubButton
                      variant={
                        isActive(`/dashboard/alerts/${section.id}`)
                          ? "secondary"
                          : "default"
                      }
                    >
                      {section.name}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Estudiantes Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleMenu("students")}
              variant={
                isSubMenuActive("/dashboard/students") ? "secondary" : "default"
              }
            >
              <Users className="h-5 w-5" />
              <span>Estudiantes</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.students ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.students && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/students" passHref legacyBehavior>
                  <SidebarMenuSubButton
                    variant={
                      isActive("/dashboard/students") ? "secondary" : "default"
                    }
                  >
                    Todos los estudiantes
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {filteredSections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link
                    href={`/dashboard/students/section/${section.id}`}
                    passHref
                    legacyBehavior
                  >
                    <SidebarMenuSubButton
                      variant={
                        isActive(`/dashboard/students/section/${section.id}`)
                          ? "secondary"
                          : "default"
                      }
                    >
                      {section.name}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Gestión de Casos Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => toggleMenu("cases")}
              variant={
                isSubMenuActive("/dashboard/case-management")
                  ? "secondary"
                  : "default"
              }
            >
              <CalendarDays className="h-5 w-5" />
              <span>Gestión de Casos</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.cases ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.cases && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/case-management" passHref legacyBehavior>
                  <SidebarMenuSubButton
                    variant={
                      isActive("/dashboard/case-management")
                        ? "secondary"
                        : "default"
                    }
                  >
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {filteredSections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link
                    href={`/dashboard/case-management/${section.id}`}
                    passHref
                    legacyBehavior
                  >
                    <SidebarMenuSubButton
                      variant={
                        isActive(`/dashboard/case-management/${section.id}`)
                          ? "secondary"
                          : "default"
                      }
                    >
                      {section.name}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Settings Link - solo visible para administradores */}
          {currentUser?.role === "ADMIN" && (
            <SidebarMenuItem>
              <Link href="/dashboard/settings" passHref legacyBehavior>
                <SidebarMenuButton
                  variant={
                    isActive("/dashboard/settings") ? "primary" : "default"
                  }
                >
                  <Cog className="h-5 w-5" />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} LTSM
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
