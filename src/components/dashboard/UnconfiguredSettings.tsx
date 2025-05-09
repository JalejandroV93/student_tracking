// src/components/dashboard/UnconfiguredSettings.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import Link from "next/link";

export function UnconfiguredSettings() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center">
      <Alert className="max-w-md mb-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Configuración Requerida</AlertTitle>
        <AlertDescription>
          Los umbrales de alerta no han sido configurados. Algunas
          funcionalidades del dashboard (como las alertas) no estarán
          disponibles hasta que se configuren.
        </AlertDescription>
      </Alert>
      <Link href="/dashboard/settings" passHref legacyBehavior>
        <Button>Ir a Configuración</Button>
      </Link>
    </div>
  );
}
