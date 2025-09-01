"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FaultTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const FaultTypeSelector = React.memo(function FaultTypeSelector({
  value,
  onValueChange,
  disabled = false,
}: FaultTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tipo-falta" className="text-sm font-medium">
        Tipo de Falta *
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona el tipo de falta que se está cargando" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Tipo I">Tipo I</SelectItem>
          <SelectItem value="Tipo II">Tipo II</SelectItem>
          <SelectItem value="Tipo III">Tipo III</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Este tipo se aplicará a todas las faltas del archivo CSV que se cargue.
      </p>
    </div>
  );
});
