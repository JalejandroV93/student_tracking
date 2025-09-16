import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertCircle } from "lucide-react";
import { CreateSchoolYearRequest } from "@/types/school-year";

interface SchoolYearFormProps {
  onSubmit: (data: CreateSchoolYearRequest) => Promise<boolean>;
  onCancel: () => void;
}

interface FormData {
  name: string;
  phidias_id?: string;
  startDate: string;
  endDate: string;
  description?: string;
  trimester1Name: string;
  trimester1Start: string;
  trimester1End: string;
  trimester2Name: string;
  trimester2Start: string;
  trimester2End: string;
  trimester3Name: string;
  trimester3Start: string;
  trimester3End: string;
}

export function SchoolYearForm({ onSubmit, onCancel }: SchoolYearFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      trimester1Name: "Primer Trimestre",
      trimester2Name: "Segundo Trimestre",
      trimester3Name: "Tercer Trimestre",
    },
  });

  const onFormSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // Validar fechas
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        setLoading(false);
        return;
      }

      // Validar fechas de trimestres
      const trimestre1Start = new Date(data.trimester1Start);
      const trimestre1End = new Date(data.trimester1End);
      const trimestre2Start = new Date(data.trimester2Start);
      const trimestre2End = new Date(data.trimester2End);
      const trimestre3Start = new Date(data.trimester3Start);
      const trimestre3End = new Date(data.trimester3End);

      // Validar que cada trimestre sea válido
      if (trimestre1Start >= trimestre1End) {
        setError("Las fechas del primer trimestre son inválidas");
        setLoading(false);
        return;
      }

      if (trimestre2Start >= trimestre2End) {
        setError("Las fechas del segundo trimestre son inválidas");
        setLoading(false);
        return;
      }

      if (trimestre3Start >= trimestre3End) {
        setError("Las fechas del tercer trimestre son inválidas");
        setLoading(false);
        return;
      }

      // Validar secuencia de trimestres
      if (trimestre1End >= trimestre2Start) {
        setError("El primer trimestre debe terminar antes del segundo");
        setLoading(false);
        return;
      }

      if (trimestre2End >= trimestre3Start) {
        setError("El segundo trimestre debe terminar antes del tercero");
        setLoading(false);
        return;
      }

      // Crear objeto para enviar
      const schoolYearData: CreateSchoolYearRequest = {
        name: data.name,
        phidias_id: data.phidias_id ? parseInt(data.phidias_id) : null,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        trimestres: [
          {
            name: data.trimester1Name,
            order: 1,
            startDate: data.trimester1Start,
            endDate: data.trimester1End,
          },
          {
            name: data.trimester2Name,
            order: 2,
            startDate: data.trimester2Start,
            endDate: data.trimester2End,
          },
          {
            name: data.trimester3Name,
            order: 3,
            startDate: data.trimester3Start,
            endDate: data.trimester3End,
          },
        ],
      };

      const success = await onSubmit(schoolYearData);
      if (success) {
        reset();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Información básica del año escolar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información General</CardTitle>
          <CardDescription>
            Define los datos básicos del año escolar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Año Escolar *</Label>
              <Input
                id="name"
                placeholder="Ej: 2024-2025"
                {...register("name", {
                  required: "El nombre es obligatorio",
                  pattern: {
                    value: /^\d{4}-\d{4}$/,
                    message: "El formato debe ser YYYY-YYYY (ej: 2024-2025)",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="Descripción opcional"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phidias_id">ID de Phidias</Label>
              <Input
                id="phidias_id"
                type="number"
                placeholder="ID del año en Phidias"
                {...register("phidias_id")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", {
                  required: "La fecha de inicio es obligatoria",
                })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin *</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", {
                  required: "La fecha de fin es obligatoria",
                })}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de trimestres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Trimestres
          </CardTitle>
          <CardDescription>
            Define las fechas de cada trimestre del año escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primer Trimestre */}
            <div className="space-y-4">
              <h4 className="font-medium text-center">Primer Trimestre</h4>
              <div className="space-y-2">
                <Label htmlFor="trimester1Name">Nombre</Label>
                <Input
                  id="trimester1Name"
                  {...register("trimester1Name", {
                    required: "El nombre del trimestre es obligatorio",
                  })}
                />
                {errors.trimester1Name && (
                  <p className="text-sm text-red-600">
                    {errors.trimester1Name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester1Start">Fecha de Inicio</Label>
                <Input
                  id="trimester1Start"
                  type="date"
                  {...register("trimester1Start", {
                    required: "La fecha de inicio es obligatoria",
                  })}
                />
                {errors.trimester1Start && (
                  <p className="text-sm text-red-600">
                    {errors.trimester1Start.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester1End">Fecha de Fin</Label>
                <Input
                  id="trimester1End"
                  type="date"
                  {...register("trimester1End", {
                    required: "La fecha de fin es obligatoria",
                  })}
                />
                {errors.trimester1End && (
                  <p className="text-sm text-red-600">
                    {errors.trimester1End.message}
                  </p>
                )}
              </div>
            </div>

            {/* Segundo Trimestre */}
            <div className="space-y-4">
              <h4 className="font-medium text-center">Segundo Trimestre</h4>
              <div className="space-y-2">
                <Label htmlFor="trimester2Name">Nombre</Label>
                <Input
                  id="trimester2Name"
                  {...register("trimester2Name", {
                    required: "El nombre del trimestre es obligatorio",
                  })}
                />
                {errors.trimester2Name && (
                  <p className="text-sm text-red-600">
                    {errors.trimester2Name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester2Start">Fecha de Inicio</Label>
                <Input
                  id="trimester2Start"
                  type="date"
                  {...register("trimester2Start", {
                    required: "La fecha de inicio es obligatoria",
                  })}
                />
                {errors.trimester2Start && (
                  <p className="text-sm text-red-600">
                    {errors.trimester2Start.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester2End">Fecha de Fin</Label>
                <Input
                  id="trimester2End"
                  type="date"
                  {...register("trimester2End", {
                    required: "La fecha de fin es obligatoria",
                  })}
                />
                {errors.trimester2End && (
                  <p className="text-sm text-red-600">
                    {errors.trimester2End.message}
                  </p>
                )}
              </div>
            </div>

            {/* Tercer Trimestre */}
            <div className="space-y-4">
              <h4 className="font-medium text-center">Tercer Trimestre</h4>
              <div className="space-y-2">
                <Label htmlFor="trimester3Name">Nombre</Label>
                <Input
                  id="trimester3Name"
                  {...register("trimester3Name", {
                    required: "El nombre del trimestre es obligatorio",
                  })}
                />
                {errors.trimester3Name && (
                  <p className="text-sm text-red-600">
                    {errors.trimester3Name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester3Start">Fecha de Inicio</Label>
                <Input
                  id="trimester3Start"
                  type="date"
                  {...register("trimester3Start", {
                    required: "La fecha de inicio es obligatoria",
                  })}
                />
                {errors.trimester3Start && (
                  <p className="text-sm text-red-600">
                    {errors.trimester3Start.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trimester3End">Fecha de Fin</Label>
                <Input
                  id="trimester3End"
                  type="date"
                  {...register("trimester3End", {
                    required: "La fecha de fin es obligatoria",
                  })}
                />
                {errors.trimester3End && (
                  <p className="text-sm text-red-600">
                    {errors.trimester3End.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Año Escolar"}
        </Button>
      </div>
    </form>
  );
}
