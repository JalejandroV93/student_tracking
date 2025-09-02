import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Clock,
  BookOpen,
  UserCheck,
} from "lucide-react";
import type { Infraction, Student } from "@/types/dashboard";

interface InfractionDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  infraction: Infraction;
  student: Student;
}

export function InfractionDetailsModal({
  isOpen,
  onOpenChange,
  infraction,
  student,
}: InfractionDetailsModalProps) {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Tipo I":
        return "secondary";
      case "Tipo II":
        return "default";
      case "Tipo III":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case "Tipo I":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Tipo II":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Tipo III":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-6 border-b bg-gradient-to-r from-slate-50 to-slate-100 -m-6 mb-0 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                <div
                  className={`p-2 rounded-lg ${getSeverityColor(
                    infraction.type
                  )}`}
                >
                  <AlertTriangle className="h-6 w-6" />
                </div>
                Detalles de la Falta2
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-base">
                Información completa del incidente registrado
              </DialogDescription>
            </div>
            <Badge
              variant={getBadgeVariant(infraction.type)}
              className="text-sm px-3 py-1 font-semibold"
            >
              {infraction.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                Información del Estudiante
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-blue-700">
                  Nombre Completo
                </label>
                <p className="text-slate-900 font-medium">{student.name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-blue-700">
                  ID Estudiante
                </label>
                <p className="text-slate-900 font-mono font-medium">
                  {student.id}
                </p>
              </div>
              {student.grado !== "No especificado" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-blue-700">
                    Grado
                  </label>
                  <p className="text-slate-900 font-medium">{student.grado}</p>
                </div>
              )}
              {student.level !== "No especificado" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-blue-700">
                    Nivel Académico
                  </label>
                  <p className="text-slate-900 font-medium">{student.level}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Detalles del Incidente
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Fecha
                  </span>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatDate(infraction.date)}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Número
                  </span>
                </div>
                <p className="font-semibold text-slate-900 font-mono">
                  {infraction.number}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Estado
                  </span>
                </div>
                <Badge
                  variant={infraction.attended ? "outline" : "secondary"}
                  className={`${
                    infraction.attended
                      ? "text-green-700 border-green-300 bg-green-50"
                      : "text-amber-700 border-amber-300 bg-amber-50"
                  } font-medium`}
                >
                  {infraction.attended ? "Atendida" : "Pendiente"}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Descripción del Incidente
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed">
                    {infraction.description || "No se proporcionó descripción"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Detalles Adicionales
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed">
                    {infraction.details ||
                      "No se proporcionaron detalles adicionales"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Acciones Reparadoras
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed">
                    {infraction.remedialActions ||
                      "No se definieron acciones reparadoras"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Información Académica y Administrativa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">
                    Trimestre
                  </label>
                  <p className="text-slate-900 font-medium">
                    {infraction.trimester || "No especificado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">
                    Nivel Académico
                  </label>
                  <p className="text-slate-900 font-medium">
                    {infraction.level || "No especificado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">
                    Registrado por
                  </label>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <p className="text-slate-900 font-medium">
                      {infraction.author || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t bg-slate-50 -m-6 mt-0 p-6">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="px-6 py-2 font-medium bg-transparent"
            >
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
