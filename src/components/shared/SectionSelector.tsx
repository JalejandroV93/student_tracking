"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/AuthProvider"
import { Role } from "@prisma/client"
import { useMemo } from "react"

interface SectionSelectorProps {
  currentSection: string
  baseRoute: string
}

// Mapping of roles to allowed sections
const roleToSectionPermissions: Record<Role, string[]> = {
  [Role.ADMIN]: ["preschool", "elementary", "middle", "high"],
  [Role.PRESCHOOL_COORDINATOR]: ["preschool"],
  [Role.ELEMENTARY_COORDINATOR]: ["elementary"],
  [Role.MIDDLE_SCHOOL_COORDINATOR]: ["middle"],
  [Role.HIGH_SCHOOL_COORDINATOR]: ["high"],
  [Role.PSYCHOLOGY]: ["preschool", "elementary", "middle", "high"],
  [Role.TEACHER]: [], // Teachers only see their specific group, not general sections
  [Role.USER]: [],
  [Role.STUDENT]: [],
}

// Definir secciones disponibles fuera del componente para evitar re-renders
const allSections = [
  { id: "preschool", name: "Preschool" },
  { id: "elementary", name: "Elementary" },
  { id: "middle", name: "Middle School" },
  { id: "high", name: "High School" },
]

export function SectionSelector({ currentSection, baseRoute }: SectionSelectorProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Filtrar secciones según el rol del usuario
  const sections = useMemo(() => {
    if (!user) return []

    const allowedSections = roleToSectionPermissions[user.role] || []
    return allSections.filter(section => allowedSections.includes(section.id))
  }, [user])

  // Check if user can view the "All" option
  const canViewAll = useMemo(() => {
    if (!user) return false
    
    // Solo ADMIN y PSYCHOLOGY pueden ver todas las secciones
    return user.role === Role.ADMIN || user.role === Role.PSYCHOLOGY
  }, [user])

  const handleSectionChange = (sectionId: string) => {
    // Actualizar la URL para reflejar la sección seleccionada
    window.history.pushState({}, "", `?section=${sectionId}`)

    // Navegar a la página correspondiente
    router.push(`/${baseRoute}/${sectionId}`)
  }

  // Si el usuario no tiene permisos para ver ninguna sección, no mostrar el selector
  if (!user || sections.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canViewAll && (
        <Button
          variant={currentSection === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSectionChange("all")}
        >
          Todas
        </Button>
      )}

      {sections.map((section) => (
        <Button
          key={section.id}
          variant={currentSection === section.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleSectionChange(section.id)}
        >
          {section.name}
        </Button>
      ))}
    </div>
  )
}

