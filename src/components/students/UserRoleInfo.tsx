"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, GraduationCap, Brain, BookOpen, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Role } from "@prisma/client";

const roleConfig = {
  ADMIN: {
    label: "Administrador",
    icon: Shield,
    color: "bg-purple-500 text-white",
    description: "Acceso completo a todos los estudiantes y secciones"
  },
  PRESCHOOL_COORDINATOR: {
    label: "Coordinador Preescolar",
    icon: GraduationCap,
    color: "bg-blue-500 text-white",
    description: "Acceso a estudiantes de Preescolar"
  },
  ELEMENTARY_COORDINATOR: {
    label: "Coordinador Primaria",
    icon: BookOpen,
    color: "bg-green-500 text-white",
    description: "Acceso a estudiantes de Primaria"
  },
  MIDDLE_SCHOOL_COORDINATOR: {
    label: "Coordinador Secundaria",
    icon: Users,
    color: "bg-yellow-500 text-white",
    description: "Acceso a estudiantes de Secundaria"
  },
  HIGH_SCHOOL_COORDINATOR: {
    label: "Coordinador Bachillerato",
    icon: GraduationCap,
    color: "bg-purple-500 text-white",
    description: "Acceso a estudiantes de Bachillerato"
  },
  PSYCHOLOGY: {
    label: "Psicología",
    icon: Brain,
    color: "bg-pink-500 text-white",
    description: "Acceso a estudiantes de todas las secciones"
  },
  TEACHER: {
    label: "Director de Grupo",
    icon: User,
    color: "bg-orange-500 text-white",
    description: "Acceso solo a estudiantes de su grupo asignado"
  },
  USER: {
    label: "Usuario",
    icon: User,
    color: "bg-gray-500 text-white",
    description: "Acceso limitado según permisos"
  },
  STUDENT: {
    label: "Estudiante",
    icon: User,
    color: "bg-gray-400 text-white",
    description: "Sin acceso de búsqueda"
  },
};

export function UserRoleInfo() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  const config = roleConfig[user.role as Role] || roleConfig.USER;
  const Icon = config.icon;

  return (
    <Card className="border-none mb-2 rounded-full">
      <CardContent className="flex gap-2"  >
          <Badge className={config.color}>
            <Icon className="w-4 h-4 mr-1" />
            {config.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {config.description}
          </span>
        {user.role === "TEACHER" && (
          <div className="mt-2">
            <span className="text-xs text-muted-foreground">
              Grupo asignado: <strong className="text-foreground">Sin especificar</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
