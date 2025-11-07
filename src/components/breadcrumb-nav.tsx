"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

// Mapeo de rutas a nombres legibles en español
const routeLabels: Record<string, string> = {
  // Secciones principales
  dashboard: "Dashboard",
  students: "Estudiantes",
  alerts: "Alertas",
  "case-management": "Gestión de Casos",
  reports: "Reportes",
  profile: "Perfil",
  settings: "Configuración",
  faltas: "Faltas",

  // Subsecciones de settings
  users: "Usuarios",
  "school-years": "Años Escolares",
  phidias: "Phidias",
  audit: "Auditoría",

  // Subsecciones de phidias
  sync: "Sincronización",
  seguimientos: "Seguimientos",

  // Acciones
  import: "Importar",

  // Secciones académicas
  preschool: "Preescolar",
  elementary: "Primaria",
  middle: "Secundaria",
  high: "Preparatoria",
};

interface BreadcrumbNavProps {
  /**
   * Elementos personalizados adicionales para agregar al final del breadcrumb
   * Útil para páginas dinámicas o con información específica
   */
  customItems?: Array<{
    label: string;
    href?: string;
  }>;

  /**
   * Ocultar el ícono de inicio
   */
  hideHomeIcon?: boolean;
}

export function BreadcrumbNav({ customItems, hideHomeIcon = false }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // No mostrar breadcrumb en la página principal del dashboard
  if (pathname === "/dashboard") {
    return null;
  }

  // Dividir la ruta en segmentos
  const segments = pathname.split("/").filter(Boolean);

  // Generar las rutas acumulativas
  const paths = segments.map((_, index) => {
    return "/" + segments.slice(0, index + 1).join("/");
  });

  // Generar los items del breadcrumb
  const breadcrumbItems = segments.map((segment, index) => {
    const path = paths[index];
    const isLast = index === segments.length - 1;

    // Obtener el label del segmento, o usar el segmento capitalizado si no existe en el mapeo
    let label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // Si es un ID numérico, intentar mostrarlo de forma más amigable
    if (/^\d+$/.test(segment)) {
      label = `ID: ${segment}`;
    }

    // Si es un slug con guiones, capitalizarlo bien
    if (segment.includes("-") && !routeLabels[segment]) {
      label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return {
      label,
      path,
      isLast,
    };
  });

  // Filtrar el primer segmento "dashboard" ya que será el home
  const filteredItems = breadcrumbItems.filter((item) => item.label !== "Dashboard");

  // Agregar custom items si existen
  const allItems = customItems
    ? [
        ...filteredItems.slice(0, -1).map((item) => ({ ...item, isLast: false })),
        ...customItems.map((custom, idx) => ({
          label: custom.label,
          path: custom.href || "",
          isLast: idx === customItems.length - 1,
        })),
      ]
    : filteredItems;

  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        {/* Home/Inicio siempre presente */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              {!hideHomeIcon && <Home className="h-4 w-4 text-red-800" />}
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {allItems.map((item, index) => (
          <div key={item.path || index} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
