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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"; // Adjust path
import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation'; // Import usePathname

// No props needed anymore
// interface DashboardSidebarProps {
//   activePage: string;
//   setActivePage: (page: string) => void;
// }

const sections = [
  { id: "preschool", name: "Preescolar" },
  { id: "elementary", name: "Primaria" },
  { id: "middle", name: "Secundaria" },
  { id: "high", name: "Bachillerato" }, // Corrected name
];

export function DashboardSidebar() {
  const pathname = usePathname(); // Get current path

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    alerts: pathname.startsWith('/dashboard/alerts'), // Initialize based on path
    students: pathname.startsWith('/dashboard/students'), // Changed from 'history'
    cases: pathname.startsWith('/dashboard/case-management'),
    // reports: pathname.startsWith('/dashboard/reports'), // If reports section is added
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Helper to determine if a link is active
  const isActive = (href: string) => pathname === href;
  // Helper to determine if a submenu group is active
  const isSubMenuActive = (basePath: string) => pathname.startsWith(basePath);


  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="text-lg font-semibold">Sistema Faltas</span> {/* Use semibold */}
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Overview Link */}
          <SidebarMenuItem>
             <Link href="/dashboard" passHref legacyBehavior>
              <SidebarMenuButton variant={isActive('/dashboard') ? 'primary' : 'default'}>
                <Home className="h-5 w-5" />
                <span>Resumen</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Alertas Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("alerts")} variant={isSubMenuActive('/dashboard/alerts') ? 'secondary' : 'default'}>
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 transition-transform ${
                  expandedMenus.alerts ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Use Collapsible or simply conditional rendering */}
          {expandedMenus.alerts && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <Link href="/dashboard/alerts" passHref legacyBehavior>
                  <SidebarMenuSubButton variant={isActive('/dashboard/alerts') ? 'secondary' : 'default'}>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link href={`/dashboard/alerts/${section.id}`} passHref legacyBehavior>
                    <SidebarMenuSubButton variant={isActive(`/dashboard/alerts/${section.id}`) ? 'secondary' : 'default'}>
                       {section.name}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

          {/* Estudiantes Menu */}
           <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("students")} variant={isSubMenuActive('/dashboard/students') ? 'secondary' : 'default'}>
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
                {/* Link to the main student search/list page */}
                 <Link href="/dashboard/students" passHref legacyBehavior>
                  <SidebarMenuSubButton variant={isActive('/dashboard/students') ? 'secondary' : 'default'}>
                    Buscar / Historial
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {/* Sub-items for sections might not be needed here if search covers all */}
            </SidebarMenuSub>
          )}


          {/* Case Management Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleMenu("cases")} variant={isSubMenuActive('/dashboard/case-management') ? 'secondary' : 'default'}>
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
                  <SidebarMenuSubButton variant={isActive('/dashboard/case-management') ? 'secondary' : 'default'}>
                    Todas las secciones
                  </SidebarMenuSubButton>
                </Link>
              </SidebarMenuSubItem>
              {sections.map((section) => (
                <SidebarMenuSubItem key={section.id}>
                  <Link href={`/dashboard/case-management/${section.id}`} passHref legacyBehavior>
                    <SidebarMenuSubButton variant={isActive(`/dashboard/case-management/${section.id}`) ? 'secondary' : 'default'}>
                      {section.name}
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}

            {/* Settings Link */}
          <SidebarMenuItem>
            <Link href="/dashboard/settings" passHref legacyBehavior>
              <SidebarMenuButton variant={isActive('/dashboard/settings') ? 'primary' : 'default'}>
                <Cog className="h-5 w-5" />
                <span>Configuración</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
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