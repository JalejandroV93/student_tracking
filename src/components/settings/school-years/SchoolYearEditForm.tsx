"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Save, X } from "lucide-react";
import { SchoolYear, UpdateSchoolYearRequest } from "@/types/school-year";
import { format } from "date-fns";

interface SchoolYearEditFormProps {
  schoolYear: SchoolYear;
  onSubmit: (id: number, data: UpdateSchoolYearRequest) => Promise<boolean>;
  onCancel: () => void;
}

export function SchoolYearEditForm({
  schoolYear,
  onSubmit,
  onCancel,
}: SchoolYearEditFormProps) {
  const [formData, setFormData] = useState({
    name: schoolYear.name,
    startDate: format(new Date(schoolYear.startDate), "yyyy-MM-dd"),
    endDate: format(new Date(schoolYear.endDate), "yyyy-MM-dd"),
    description: schoolYear.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData: UpdateSchoolYearRequest = {
        name: formData.name !== schoolYear.name ? formData.name : undefined,
        startDate: formData.startDate !== format(new Date(schoolYear.startDate), "yyyy-MM-dd") 
          ? formData.startDate : undefined,
        endDate: formData.endDate !== format(new Date(schoolYear.endDate), "yyyy-MM-dd")
          ? formData.endDate : undefined,
        description: formData.description !== (schoolYear.description || "") 
          ? formData.description : undefined,
      };

      // Solo enviar si hay cambios
      const hasChanges = Object.values(updateData).some(value => value !== undefined);
      if (!hasChanges) {
        onCancel();
        return;
      }

      const success = await onSubmit(schoolYear.id, updateData);
      if (success) {
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Año Escolar *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: 2024-2025"
            required
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descripción del año escolar"
          />
        </div>

        {/* Fecha de inicio */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de Inicio *</Label>
          <div className="relative">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Fecha de fin */}
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de Fin *</Label>
          <div className="relative">
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Información sobre trimestres */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los trimestres no pueden ser editados desde aquí. 
          Para modificar trimestres, contacta al administrador del sistema.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
