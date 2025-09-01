import { Info } from "lucide-react";
import React from "react";

interface EmptyInfractionsStateProps {
  message?: string;
  height?: string;
}

export function EmptyInfractionsState({
  message = "No hay infracciones registradas.",
  height = "h-[100px]",
}: EmptyInfractionsStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${height} text-muted-foreground border rounded-md`}
    >
      <Info className="w-6 h-6 mb-2" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
