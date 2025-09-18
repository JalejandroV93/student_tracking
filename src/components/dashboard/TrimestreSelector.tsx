import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TrimestreSelectorProps {
  currentTrimestre: string | undefined;
  onTrimestreChange: (trimestre: string) => void;
  dashboardFilters?: {
    filters: {
      schoolYearId: string | null;
      trimestre: string;
    };
    setSchoolYear: (schoolYearId: string) => void;
    setTrimestre: (trimestre: string) => void;
  };
}

interface TrimestreOption {
  id: number;
  name: string;
  order: number;
  schoolYearId: number;
  schoolYearName: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface SchoolYearGroup {
  schoolYearId: number;
  schoolYearName: string;
  isActive: boolean;
  trimestres: TrimestreOption[];
}

export function TrimestreSelector({
  currentTrimestre,
  onTrimestreChange,
  dashboardFilters,
}: TrimestreSelectorProps) {
  const [trimestres, setTrimestres] = useState<TrimestreOption[]>([]);
  const [selectedSchoolYear, setSelectedSchoolYear] =
    useState<string>("active");
  const [loading, setLoading] = useState(false);

  // Usar filtros globales si están disponibles
  const effectiveSchoolYear =
    dashboardFilters?.filters.schoolYearId ?? selectedSchoolYear;
  const effectiveSetSchoolYear =
    dashboardFilters?.setSchoolYear ?? setSelectedSchoolYear;

  // Cargar trimestres desde la API
  useEffect(() => {
    const loadTrimestres = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/v1/trimestres");
        const data = await response.json();
        if (data.success) {
          setTrimestres(data.trimestres);
        } else {
          console.error("Error loading trimestres:", data.error);
        }
      } catch (error) {
        console.error("Error loading trimestres:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrimestres();
  }, []);

  // Agrupar trimestres por año escolar
  const schoolYearGroups = trimestres.reduce((groups, trimestre) => {
    const key = trimestre.schoolYearId.toString();
    if (!groups[key]) {
      groups[key] = {
        schoolYearId: trimestre.schoolYearId,
        schoolYearName: trimestre.schoolYearName,
        isActive: trimestre.isActive,
        trimestres: [],
      };
    }
    groups[key].trimestres.push(trimestre);
    return groups;
  }, {} as Record<string, SchoolYearGroup>);

  // Filtrar trimestres según el año escolar seleccionado
  const filteredTrimestres =
    effectiveSchoolYear === "all"
      ? trimestres
      : effectiveSchoolYear === "active"
      ? trimestres.filter((t) => t.isActive)
      : trimestres.filter(
          (t) => t.schoolYearId.toString() === effectiveSchoolYear
        );

  // Obtener el año escolar activo
  const activeSchoolYear = Object.values(schoolYearGroups).find(
    (group) => group.isActive
  );

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Selector de Año Escolar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Año:</span>
        <Select
          value={effectiveSchoolYear}
          onValueChange={effectiveSetSchoolYear}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Año escolar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <span>Activo</span>
                <Badge variant="secondary" className="text-xs">
                  {activeSchoolYear?.schoolYearName || "N/A"}
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="all">Todos los años</SelectItem>
            {Object.values(schoolYearGroups)
              .sort((a, b) => b.schoolYearName.localeCompare(a.schoolYearName))
              .map((group) => (
                <SelectItem
                  key={group.schoolYearId}
                  value={group.schoolYearId.toString()}
                >
                  <div className="flex items-center gap-2">
                    <span>{group.schoolYearName}</span>
                    {group.isActive && (
                      <Badge variant="default" className="text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selector de Trimestre */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Trimestre:</span>
        <Select
          value={currentTrimestre || "all"}
          onValueChange={onTrimestreChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar trimestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los trimestres</SelectItem>
            {filteredTrimestres
              .sort((a, b) => a.order - b.order)
              .map((trimestre) => (
                <SelectItem key={trimestre.id} value={trimestre.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{trimestre.name}</span>
                    {effectiveSchoolYear === "all" && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {trimestre.schoolYearName}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
