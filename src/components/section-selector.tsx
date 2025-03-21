"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SectionSelectorProps {
  currentSection: string
  baseRoute: string
}

export function SectionSelector({ currentSection, baseRoute }: SectionSelectorProps) {
  const router = useRouter()

  const sections = [
    { id: "preschool", name: "Preescolar" },
    { id: "elementary", name: "Primaria" },
    { id: "middle", name: "Secundaria" },
    { id: "high", name: "Preparatoria" },
  ]

  const handleSectionChange = (sectionId: string) => {
    // Actualizar la URL para reflejar la sección seleccionada
    window.history.pushState({}, "", `?section=${sectionId}`)

    // Navegar a la página correspondiente
    router.push(`/${baseRoute}/${sectionId}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={currentSection === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => handleSectionChange("all")}
      >
        Todas
      </Button>

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

