"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";
import { SchoolYear } from "@/hooks/useSchoolYears";
import { Student, CreateStudentData, UpdateStudentData } from "@/hooks/useStudentManagement";

interface StudentFormProps {
  student?: Student | null;
  onSave: (data: CreateStudentData | UpdateStudentData) => Promise<void>;
  onCancel: () => void;
  schoolYears: SchoolYear[];
}

export function StudentForm({ student, onSave, onCancel, schoolYears }: StudentFormProps) {
  const [formData, setFormData] = useState({
    codigo: student?.code ? parseInt(student.code) : 0,
    nombre: student?.name || "",
    firstname: student?.firstname || "",
    lastname: student?.lastname || "",
    grado: student?.grado || "",
    seccion: student?.seccion || "",
    school_year_id: schoolYears.find(y => y.isActive)?.id || 0,
    photo_url: student?.photo_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        codigo: parseInt(student.code) || 0,
        nombre: student.name || "",
        firstname: student.firstname || "",
        lastname: student.lastname || "",
        grado: student.grado || "",
        seccion: student.seccion || "",
        school_year_id: schoolYears.find(y => y.isActive)?.id || 0,
        photo_url: student.photo_url || "",
      });
    }
  }, [student, schoolYears]);

  const gradoOptions = [
    "Kínder 5", "Primero", "Segundo", "Tercero", "Cuarto", "Quinto",
    "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo", "Once"
  ];

  const seccionOptions = ["Mi Taller", "Preschool", "Elementary", "Middle School", "High School"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo || formData.codigo <= 0) {
      newErrors.codigo = "El código es requerido y debe ser mayor a 0";
    }

    if (!formData.firstname.trim()) {
      newErrors.firstname = "El nombre es requerido";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "El apellido es requerido";
    }

    if (!formData.grado) {
      newErrors.grado = "El grado es requerido";
    }

    if (!formData.seccion) {
      newErrors.seccion = "La sección es requerida";
    }

    if (!formData.school_year_id) {
      newErrors.school_year_id = "El año académico es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generar nombre completo
    const nombreCompleto = `${formData.firstname.trim()} ${formData.lastname.trim()}`;
    
    if (student) {
      // Actualizar estudiante existente
      const updateData: UpdateStudentData = {
        nombre: nombreCompleto,
        firstname: formData.firstname,
        lastname: formData.lastname,
        grado: formData.grado,
        seccion: formData.seccion,
        school_year_id: formData.school_year_id,
        photo_url: formData.photo_url || undefined,
      };
      await onSave(updateData);
    } else {
      // Crear nuevo estudiante
      const createData: CreateStudentData = {
        codigo: formData.codigo,
        nombre: nombreCompleto,
        firstname: formData.firstname,
        lastname: formData.lastname,
        grado: formData.grado,
        seccion: formData.seccion,
        school_year_id: formData.school_year_id,
        photo_url: formData.photo_url || undefined,
      };
      await onSave(createData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {student ? "Editar Estudiante" : "Nuevo Estudiante"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  type="number"
                  value={formData.codigo || ""}
                  onChange={(e) => handleInputChange("codigo", parseInt(e.target.value) || 0)}
                  disabled={!!student} // No permitir editar código en estudiantes existentes
                />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo}</p>
                )}
              </div>

              {/* Año académico */}
              <div className="space-y-2">
                <Label>Año Académico *</Label>
                <Select
                  value={formData.school_year_id.toString()}
                  onValueChange={(value) => handleInputChange("school_year_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año académico" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.name} {year.isActive && "(Activo)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.school_year_id && (
                  <p className="text-sm text-red-500">{errors.school_year_id}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="firstname">Nombre *</Label>
                <Input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                />
                {errors.firstname && (
                  <p className="text-sm text-red-500">{errors.firstname}</p>
                )}
              </div>

              {/* Apellido */}
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido *</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={(e) => handleInputChange("lastname", e.target.value)}
                />
                {errors.lastname && (
                  <p className="text-sm text-red-500">{errors.lastname}</p>
                )}
              </div>

              {/* Grado */}
              <div className="space-y-2">
                <Label>Grado *</Label>
                <Select
                  value={formData.grado}
                  onValueChange={(value) => handleInputChange("grado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradoOptions.map((grado) => (
                      <SelectItem key={grado} value={grado}>
                        {grado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grado && (
                  <p className="text-sm text-red-500">{errors.grado}</p>
                )}
              </div>

              {/* Sección */}
              <div className="space-y-2">
                <Label>Sección *</Label>
                <Select
                  value={formData.seccion}
                  onValueChange={(value) => handleInputChange("seccion", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {seccionOptions.map((seccion) => (
                      <SelectItem key={seccion} value={seccion}>
                        {seccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.seccion && (
                  <p className="text-sm text-red-500">{errors.seccion}</p>
                )}
              </div>
            </div>

            {/* URL de foto */}
            <div className="space-y-2">
              <Label htmlFor="photo_url">URL de la Foto (Opcional)</Label>
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => handleInputChange("photo_url", e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {student ? "Actualizar" : "Crear"} Estudiante
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}