"use client";

import { useState } from "react";
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
        return "default";
      case "Tipo II":
        return "outline";
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
        <div className="bg-[#be1522] text-white px-6 py-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-white text-xl font-semibold">
              <AlertTriangle className="h-6 w-6" />
              Detalles de la Falta #{infraction.number} - {infraction.type}
            </DialogTitle>
            <DialogDescription className="text-red-100 flex justify-between">
              Información completa de la falta registrada
              {/* Agregar Estado de falta a la derecha del header del modal */}
              <span className="ml-4 text-sm">
                Estado de la falta:{" "}
                <Badge variant={infraction.attended ? "default" : "outline"} className="bg-white">
                  {infraction.attended ? "Atendida" : "No atendida"}
                </Badge>
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-4">
          <div className="space-y-6">
            {/* Información del Estudiante */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-5 rounded-xl">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <User className="h-5 w-5 text-[#be1522]" />
                Información del Estudiante
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-slate-600 text-xs uppercase tracking-wide">
                    Nombre
                  </span>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-slate-600 text-xs uppercase tracking-wide">
                    ID
                  </span>
                  <p className="font-semibold text-slate-900">{student.id}</p>
                </div>
                {student.grado !== "No especificado" && (
                  <div className="space-y-1">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide">
                      Grado
                    </span>
                    <p className="font-semibold text-slate-900">
                      {student.grado}
                    </p>
                  </div>
                )}
                {student.level !== "No especificado" && (
                  <div className="space-y-1">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide">
                      Nivel
                    </span>
                    <p className="font-semibold text-slate-900">
                      {student.seccion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            

            {/* Información de la Falta */}
            <div>
              <div className="space-y-6">
                {/* Información Académica */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Trimestre
                    </span>
                    <p className="font-semibold text-slate-900">
                      {infraction.trimester || "No especificado"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Nivel Académico
                    </span>
                    <p className="font-semibold text-slate-900">
                      {infraction.level || "No especificado"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Registrado por
                    </span>
                    <p className="font-semibold text-slate-900">
                      {infraction.author || "No especificado"}
                    </p>
                  </div>
                </div>
                {/* Fecha y Tipo */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg ">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#be1522]" />
                    <div>
                      <span className="font-medium text-slate-600 text-sm">
                        Fecha de la Falta
                      </span>
                      <p className="font-semibold text-slate-900">
                        {formatDate(infraction.date)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getBadgeVariant(infraction.type)}
                    className="text-sm px-3 py-1"
                  >
                    {infraction.type}
                  </Badge>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Descripción */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Falta Según el Manual de Convivencia
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      {infraction.description ||
                        "No se proporcionó descripción"}
                    </p>
                  </div>
                  {/* Detalles de la Falta */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Descripción
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      {infraction.details ||
                        "No se proporcionaron detalles adicionales"}
                    </p>
                  </div>

                  

                  {/* Acciones Reparadoras */}
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                      Acciones Reparadoras
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      {infraction.remedialActions ||
                        "No se definieron acciones reparadoras"}
                    </p>
                  </div>
                </div>

                

                {/* Estado */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <span className="font-medium text-slate-600 text-xs uppercase tracking-wide block mb-2">
                    Estado
                  </span>
                  <Badge
                    variant={infraction.attended ? "outline" : "secondary"}
                    className={
                      infraction.attended
                        ? "text-green-700 border-green-300 bg-green-50"
                        : "text-orange-700 border-orange-300 bg-orange-50"
                    }
                  >
                    {infraction.attended ? "Atendida" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </div>

           

            {/* Sección de Observaciones */}
            <div>
              <h4 className="font-semibold mb-6 flex items-center gap-2 text-slate-800 text-lg">
                <MessageSquare className="h-5 w-5 text-[#be1522]" />
                Observaciones
              </h4>

              {/* Observación existente */}
              {infraction.observaciones && (
                <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-blue-800 text-sm">
                      Observación registrada
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {infraction.observacionesFecha &&
                        formatDate(infraction.observacionesFecha)}{" "}
                      - {infraction.observacionesAutor}
                    </span>
                  </div>
                  <p className="text-blue-800 leading-relaxed">
                    {infraction.observaciones}
                  </p>
                </div>
              )}

              {/* Agregar nueva observación */}
              <div className="space-y-4 p-5 border border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <label className="font-medium text-slate-700 text-sm block mb-2">
                    Nueva observación
                  </label>
                  <Textarea
                    id="observaciones"
                    placeholder="Escriba sus observaciones sobre esta falta..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                    className="resize-none border-slate-300 focus:border-[#be1522] focus:ring-[#be1522]"
                  />
                </div>

                <Button
                  onClick={handleAddObservaciones}
                  disabled={!observaciones.trim() || isSubmittingObservaciones}
                  className="bg-[#be1522] hover:bg-[#a01219] text-white"
                >
                  {isSubmittingObservaciones ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {infraction.observaciones ? "Actualizar" : "Agregar"}{" "}
                      Observación
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-300"
            >
              Cerrar
            </Button>

            <div className="flex gap-3">
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
