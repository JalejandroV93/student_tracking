import { Alert, AlertDescription } from "@/components/ui/alert";

export function SuccessMessage() {
  return (
    <Alert className="mx-6 mt-6 bg-green-50 text-green-800 border-green-200">
      <AlertDescription className="flex items-center">
        <div className="bg-green-100 p-1 rounded-full mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        Configuración guardada correctamente. Los nuevos umbrales se aplicarán a futuros cálculos de alerta.
      </AlertDescription>
    </Alert>
  );
}