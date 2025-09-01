import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  User,
  FileText,
  AlertTriangle,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import type { Infraction, Student } from "@/types/dashboard";

interface EnhancedInfractionDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction;
  student: Student;
  onToggleAttended: (infraction: Infraction, observaciones?: string) => void;
  onAddObservaciones: (infraction: Infraction, observaciones: string) => void;
  isLoading?: boolean;
}

export function EnhancedInfractionDetailsModal({
  isOpen,
  onOpenChange,
  infraction,
  student,
  onToggleAttended,
  onAddObservaciones,
  isLoading = false,
}: EnhancedInfractionDetailsModalProps) {
  const [observaciones, setObservaciones] = useState("");
  const [isSubmittingObservaciones, setIsSubmittingObservaciones] =
    useState(false);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Tipo I":
        return "secondary";
      case "Tipo II":
        return "warning";
      case "Tipo III":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleToggleAttended = () => {
    if (!infraction.attended && observaciones.trim()) {
      // Si se está marcando como atendida y hay observaciones, incluirlas
      onToggleAttended(infraction, observaciones.trim());
      setObservaciones("");
    } else {
      onToggleAttended(infraction);
    }
  };

  const handleAddObservaciones = async () => {
    if (observaciones.trim()) {
      setIsSubmittingObservaciones(true);
      try {
        await onAddObservaciones(infraction, observaciones.trim());
        setObservaciones("");
      } finally {
        setIsSubmittingObservaciones(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detalles de la Falta
          </DialogTitle>
          <DialogDescription>
            Información completa de la falta registrada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del Estudiante */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Estudiante
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Nombre:
                </span>
                <p className="mt-1">{student.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">ID:</span>
                <p className="mt-1">{student.id}</p>
              </div>
              {student.grado !== "No especificado" && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Grado:
                  </span>
                  <p className="mt-1">{student.grado}</p>
                </div>
              )}
              {student.level !== "No especificado" && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Nivel:
                  </span>
                  <p className="mt-1">{student.level}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de la Falta */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalles de la Falta
            </h4>

            <div className="space-y-4">
              {/* Fecha y Tipo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Fecha de la Falta:</span>
                  <span>{formatDate(infraction.date)}</span>
                </div>
                <Badge variant={getBadgeVariant(infraction.type)}>
                  {infraction.type}
                </Badge>
              </div>

              {/* Número de Falta */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Número de Falta:
                </span>
                <p className="mt-1">{infraction.number}</p>
              </div>

              {/* Descripción */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Descripción:
                </span>
                <p className="mt-1 p-3 bg-muted/30 rounded-md">
                  {infraction.description || "No se proporcionó descripción"}
                </p>
              </div>

              {/* Detalles de la Falta */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Detalle de la Falta:
                </span>
                <p className="mt-1 p-3 bg-muted/30 rounded-md">
                  {infraction.details ||
                    "No se proporcionaron detalles adicionales"}
                </p>
              </div>

              {/* Acciones Reparadoras */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Acciones Reparadoras:
                </span>
                <p className="mt-1 p-3 bg-muted/30 rounded-md">
                  {infraction.remedialActions ||
                    "No se definieron acciones reparadoras"}
                </p>
              </div>

              {/* Información Académica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Trimestre:
                  </span>
                  <p className="mt-1">
                    {infraction.trimester || "No especificado"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Nivel Académico:
                  </span>
                  <p className="mt-1">
                    {infraction.level || "No especificado"}
                  </p>
                </div>
              </div>

              {/* Autor */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Registrado por:
                </span>
                <p className="mt-1">{infraction.author || "No especificado"}</p>
              </div>

              {/* Estado */}
              <div>
                <span className="font-medium text-muted-foreground">
                  Estado:
                </span>
                <div className="mt-1">
                  <Badge
                    variant={infraction.attended ? "outline" : "secondary"}
                    className={
                      infraction.attended
                        ? "text-green-600 border-green-600/50"
                        : ""
                    }
                  >
                    {infraction.attended ? "Atendida" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sección de Observaciones */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Observaciones
            </h4>

            {/* Observación existente */}
            {infraction.observaciones && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-blue-800">
                    Observación registrada
                  </span>
                  <span className="text-xs text-blue-600">
                    {infraction.observacionesFecha &&
                      formatDate(infraction.observacionesFecha)}{" "}
                    - {infraction.observacionesAutor}
                  </span>
                </div>
                <p className="text-blue-700">{infraction.observaciones}</p>
              </div>
            )}

            {/* Agregar nueva observación */}
            <div className="space-y-3">
              <div>
                
                <Textarea
                  id="observaciones"
                  placeholder="Escriba sus observaciones sobre esta falta..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddObservaciones}
                  disabled={!observaciones.trim() || isSubmittingObservaciones}
                  size="sm"
                >
                  {isSubmittingObservaciones ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {infraction.observaciones ? "Actualizar" : "Agregar"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Acciones */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>

            <div className="flex gap-2">
              {infraction.type === "Tipo I" && (
                <Button
                  onClick={handleToggleAttended}
                  disabled={isLoading}
                  variant={infraction.attended ? "outline" : "default"}
                  className={
                    infraction.attended
                      ? "text-orange-600 border-orange-300 hover:bg-orange-50"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  ) : infraction.attended ? (
                    <X className="h-4 w-4 mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {infraction.attended
                    ? "Marcar como Pendiente"
                    : "Marcar como Atendida"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
