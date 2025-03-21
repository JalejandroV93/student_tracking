"use client"

import { AlertTriangle, BarChart4, CalendarDays, ChevronDown, Cog, FileText, Home, Users } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { useState } from "react"

interface DashboardSidebarProps {
  activePage: string
  setActivePage: (page: string) => void
}

// Definir las secciones educativas
const sections = [
  { id: "preschool", name: "Preescolar" },
  { id: "elementary", name: "Primaria" },
  { id: "middle", name: "Secundaria" },
  { id: "high", name: "Preparatoria" },
]

export function DashboardSidebar({ activePage, setActivePage }: DashboardSidebarProps) {
  // Estado para controlar qué menús están expandidos
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    alerts: false,
    history: false,
    cases: false,
    reports: false,
  })

  // Función para alternar la expansión de un menú
  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

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
            <SidebarMenuButton isActive={activePage === "overview"} onClick={() => setActivePage("overview")}>
              <Home className="h-5 w-5" />
              <span>Inicio</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Alertas */}
          <SidebarMenuItem>
            <SidebarMenuButton isActive={activePage.startsWith("alerts")} onClick={() => toggleMenu("alerts")}>
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${expandedMenus.alerts ? "rotate-180" : ""}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.alerts && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={activePage === "alerts-all"}
                  onClick={() => setActivePage("alerts-all")}
                >
                  Todas las secciones
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <SidebarMenuSubButton
                    isActive={activePage === `alerts-${section.id}`}
                    onClick={() => setActivePage(`alerts-${section.id}`)}
                  >
                    {section.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Historial de Estudiantes */}
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activePage.startsWith("student-history")}
              onClick={() => toggleMenu("history")}
            >
              <Users className="h-5 w-5" />
              <span>Historial de Estudiantes</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${expandedMenus.history ? "rotate-180" : ""}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.history && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={activePage === "student-history-all"}
                  onClick={() => setActivePage("student-history-all")}
                >
                  Todas las secciones
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <SidebarMenuSubButton
                    isActive={activePage === `student-history-${section.id}`}
                    onClick={() => setActivePage(`student-history-${section.id}`)}
                  >
                    {section.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Gestión de Casos */}
          <SidebarMenuItem>
            <SidebarMenuButton isActive={activePage.startsWith("case-management")} onClick={() => toggleMenu("cases")}>
              <CalendarDays className="h-5 w-5" />
              <span>Gestión de Casos</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${expandedMenus.cases ? "rotate-180" : ""}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.cases && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={activePage === "case-management-all"}
                  onClick={() => setActivePage("case-management-all")}
                >
                  Todas las secciones
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <SidebarMenuSubButton
                    isActive={activePage === `case-management-${section.id}`}
                    onClick={() => setActivePage(`case-management-${section.id}`)}
                  >
                    {section.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Reportes */}
          <SidebarMenuItem>
            <SidebarMenuButton isActive={activePage.startsWith("reports")} onClick={() => toggleMenu("reports")}>
              <BarChart4 className="h-5 w-5" />
              <span>Reportes</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${expandedMenus.reports ? "rotate-180" : ""}`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {expandedMenus.reports && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  isActive={activePage === "reports-all"}
                  onClick={() => setActivePage("reports-all")}
                >
                  Todas las secciones
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <SidebarMenuSubButton
                    isActive={activePage === `reports-${section.id}`}
                    onClick={() => setActivePage(`reports-${section.id}`)}
                  >
                    {section.name}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton isActive={activePage === "settings"} onClick={() => setActivePage("settings")}>
              <Cog className="h-5 w-5" />
              <span>Configuración</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">Sistema de Gestión de Faltas v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}

