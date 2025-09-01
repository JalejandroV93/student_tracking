"use client";

import React, { useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { TrimestreOption } from "@/hooks/useTrimestres";

interface TrimestreSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  trimestres: TrimestreOption[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export const TrimestreSelector = React.memo(function TrimestreSelector({
  value,
  onValueChange,
  trimestres,
  loading,
  onOpenChange,
  disabled = false,
}: TrimestreSelectorProps) {
  const activeYearTrimestres = useMemo(
    () => trimestres.filter((t) => t.isActive),
    [trimestres]
  );

  const inactiveYearTrimestres = useMemo(
    () => trimestres.filter((t) => !t.isActive),
    [trimestres]
  );

  const renderTrimestreItem = useCallback(
    (trimestre: TrimestreOption) => (
      <SelectItem key={trimestre.id} value={trimestre.id.toString()}>
        <div className="flex items-center gap-2">
          <span>
            {trimestre.name} - {trimestre.schoolYearName}
          </span>
          {trimestre.isActive && (
            <Badge variant="default" className="text-xs">
              Año Activo
            </Badge>
          )}
        </div>
      </SelectItem>
    ),
    []
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="trimestre" className="text-sm font-medium">
        Trimestre *
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        onOpenChange={onOpenChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona el trimestre al que corresponden las faltas" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando trimestres...
              </div>
            </SelectItem>
          ) : (
            <>
              {/* Trimestres del año activo */}
              {activeYearTrimestres.length > 0 && (
                <>
                  {activeYearTrimestres.map(renderTrimestreItem)}
                  {inactiveYearTrimestres.length > 0 && (
                    <div className="border-t border-gray-200 my-1" />
                  )}
                </>
              )}

              {/* Trimestres de años inactivos */}
              {inactiveYearTrimestres.map(renderTrimestreItem)}
            </>
          )}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Todas las faltas del archivo serán asignadas a este trimestre.
        {activeYearTrimestres.length > 0 && (
          <span className="block mt-1 text-blue-600">
            Los trimestres del año activo aparecen marcados con un badge.
          </span>
        )}
      </p>
    </div>
  );
});
