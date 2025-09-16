import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  User,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react";
import type { Student, Infraction, FollowUp } from "@/types/dashboard";
import { calculateStudentProfileStats, getStudentStatus, getAttendanceRate, getFollowUpProgress } from "./utils";

interface StudentProfileCardProps {
  student: Student;
  infractions: Infraction[];
  followUps: FollowUp[];
}

export function StudentProfileCard({
  student,
  infractions,
  followUps,
}: StudentProfileCardProps) {
  const stats = calculateStudentProfileStats(infractions, followUps);
  const studentStatus = getStudentStatus(stats);
  const attendanceRate = getAttendanceRate(stats);
  const followUpProgress = getFollowUpProgress(stats);
  
  // Usar el grado directamente del estudiante
  const currentGrade = student.grado && student.grado !== "No especificado" ? student.grado : "No disponible";
  
  // El nivel académico viene del student.level (Elementary, Middle School, etc.)
  const academicLevel = student.seccion;
  
  // Generar iniciales para el avatar
  const initials = student.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-slate-200 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Foto y información básica */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-4 ring-4 ring-white shadow-lg hover:scale-200 transition-transform">
              <AvatarImage 
                src={student.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=3b82f6,6366f1,8b5cf6,06b6d4,10b981&textColor=ffffff`} 
                alt={student.name} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {student.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>ID: {student.id}</span>
            </div>
            
            {/* Estado general del estudiante */}
            <Badge 
              variant={studentStatus.status === 'excellent' ? 'default' : 
                      studentStatus.status === 'good' ? 'secondary' :
                      studentStatus.status === 'attention' ? 'outline' : 'destructive'}
              className={`
                ${studentStatus.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
                  studentStatus.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  studentStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  'bg-red-100 text-red-800 border-red-200'}
              `}
            >
              {studentStatus.message}
            </Badge>
          </div>

          <Separator className="bg-gray-200" />

          {/* Información académica */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Grado</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {currentGrade !== "No especificado" ? currentGrade : "No disponible"}
              </Badge>
            </div>
            
            {academicLevel !== "No especificado" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Nivel Académico</span>
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {academicLevel}
                </Badge>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          {/* Estadísticas de faltas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span>Resumen de Faltas</span>
            </div>

            {/* Indicadores de progreso */}
            {stats.totalInfractions > 0 && (
              <div className="space-y-3">
                {/* Tasa de atención */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Faltas Atendidas</span>
                    <span className="text-gray-900 font-semibold">{attendanceRate}%</span>
                  </div>
                  <Progress 
                    value={attendanceRate} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {stats.attendedInfractions} de {stats.totalInfractions} faltas atendidas
                  </div>
                </div>

                {/* Progreso de seguimientos si hay faltas Tipo II */}
                {stats.typeIICount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Seguimientos</span>
                      <span className="text-gray-900 font-semibold">{followUpProgress}%</span>
                    </div>
                    <Progress 
                      value={followUpProgress} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {stats.completedFollowUps} de {stats.totalRequiredFollowUps} seguimientos completados
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total de faltas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-600">Total</div>
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {stats.totalInfractions}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-600">Atendidas</div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xl font-bold text-green-600 mt-1">
                  {stats.attendedInfractions}
                </div>
              </div>
            </div>

            {/* Por tipo de falta */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">Por Tipo</div>
              
              {stats.typeICount > 0 && (
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-green-800">Tipo I (Leves)</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    {stats.typeICount}
                  </Badge>
                </div>
              )}

              {stats.typeIICount > 0 && (
                <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <span className="text-sm font-medium text-yellow-800">Tipo II (Moderadas)</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    {stats.typeIICount}
                  </Badge>
                </div>
              )}

              {stats.typeIIICount > 0 && (
                <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-sm font-medium text-red-800">Tipo III (Graves)</span>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    {stats.typeIIICount}
                  </Badge>
                </div>
              )}
            </div>

            {/* Estado de seguimientos */}
            {stats.pendingFollowUps > 0 && (
              <>
                <Separator className="bg-gray-200" />
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Seguimientos Pendientes
                    </span>
                  </div>
                  <div className="text-lg font-bold text-orange-700">
                    {stats.pendingFollowUps} de {stats.totalRequiredFollowUps}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Faltas Tipo II con seguimiento requerido
                  </div>
                </div>
              </>
            )}

            {/* Estado general */}
            {stats.totalInfractions === 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-100 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">
                  Sin faltas registradas
                </p>
                <p className="text-xs text-green-600 mt-1">
                  El estudiante mantiene un registro limpio
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
