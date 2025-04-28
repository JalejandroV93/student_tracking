"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function TestPage() {
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Datos que simulan el formato FollowUp desde el frontend
  const testFollowUpData = {
    infractionId:
      "186a3f0f32f7271c3b058c2577786b66d22324fc272d7b8f2557cb01d05ebc8a",
    followUpNumber: 1,
    date: "2025-04-21",
    details: "Esto es una prueba de seguimiento",
    type: "Tipo II",
    author: "Usuario de Prueba",
  };

  // Datos transformados que deberían funcionar con el backend actual
  const transformedData = {
    id_caso: 1, // Este es un valor de prueba, en la realidad debería consultarse
    tipo_seguimiento: testFollowUpData.type,
    fecha_seguimiento: testFollowUpData.date,
    detalles: testFollowUpData.details,
    autor: testFollowUpData.author,
  };

  const sendTestToFollowupsEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testFollowUpData),
      });

      const data = await response.json();
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (!response.ok) {
        toast.error(`Error: ${data.error || response.statusText}`);
      } else {
        toast.success("Solicitud enviada con éxito");
      }
    } catch (error) {
      console.error("Error en la prueba:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestToDebugEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testFollowUpData),
      });

      const data = await response.json();
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });

      toast.success("Solicitud de prueba enviada");
    } catch (error) {
      console.error("Error en la prueba:", error);
      toast.error("Error al enviar la solicitud de prueba");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransformedData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      const data = await response.json();
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (!response.ok) {
        toast.error(`Error: ${data.error || response.statusText}`);
      } else {
        toast.success("Solicitud transformada enviada con éxito");
      }
    } catch (error) {
      console.error("Error en la prueba:", error);
      toast.error("Error al enviar la solicitud transformada");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">
        Página de Prueba para Seguimientos
      </h1>

      <div className="flex flex-col gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Datos a enviar (Formato Frontend)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded">
              {JSON.stringify(testFollowUpData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos transformados (Formato Backend)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded">
              {JSON.stringify(transformedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={sendTestToFollowupsEndpoint} disabled={isLoading}>
          Enviar a /api/followups
        </Button>

        <Button
          onClick={sendTestToDebugEndpoint}
          disabled={isLoading}
          variant="outline"
        >
          Enviar a endpoint de prueba
        </Button>

        <Button
          onClick={sendTransformedData}
          disabled={isLoading}
          variant="secondary"
        >
          Enviar datos transformados
        </Button>
      </div>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Respuesta del servidor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Status:</strong> {response.status} {response.statusText}
            </div>
            <pre className="bg-slate-100 p-4 rounded">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
