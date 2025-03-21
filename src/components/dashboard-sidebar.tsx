// src/components/dashboard-sidebar.tsx
"use client";

import {
  AlertTriangle,
  BarChart4,
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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useState } from "react";
import Link from "next/link";

interface DashboardSidebarProps {
  activePage: string; // Remove this
  setActivePage: (page: string) => void; // Remove this
}

// Definir las secciones educativas
const sections = [
  { id: "preschool", name: "Preescolar" },
  { id: "elementary", name: "Primaria" },
  { id: "middle", name: "Secundaria" },
  { id: "high", name: "Preparatoria" },
];

export function DashboardSidebar({}: DashboardSidebarProps) {
  // Remove props
  // Estado para controlar qué menús están expandidos
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    alerts: false,
    history: false,
    cases: false,
    reports: false,
  });

  // Función para alternar la expansión de un menú
  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-bold">Sistema de Faltas</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton>
                <Home className="h-5 w-5" />
                <span>Inicio</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Alertas */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("alerts")}>
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
                <Link href="/dashboard/alerts">
                  <SidebarMenuSubButton>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link href={`/dashboard/alerts/${section.id}`}>
                    <SidebarMenuSubButton>{section.name}</SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Historial de Estudiantes */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("history")}>
              <Users className="h-5 w-5" />
              <span>Historial de Estudiantes</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.history ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.history && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/students">
                  <SidebarMenuSubButton>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}

          {/* Gestión de Casos */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("cases")}>
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
                <Link href="/dashboard/case-management">
                  <SidebarMenuSubButton>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link href={`/dashboard/case-management/${section.id}`}>
                    <SidebarMenuSubButton>{section.name}</SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Reportes */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("reports")}>
              <BarChart4 className="h-5 w-5" />
              <span>Reportes</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.reports ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.reports && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/reports">
                  <SidebarMenuSubButton>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link href={`/dashboard/reports/${section.id}`}>
                    <SidebarMenuSubButton>{section.name}</SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          <SidebarMenuItem>
            <Link href="/dashboard/settings">
              <SidebarMenuButton>
                <Cog className="h-5 w-5" />
                <span>Configuración</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          Sistema de Gestión de Faltas v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
