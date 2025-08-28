import { NextResponse } from "next/server";
import { TrimestreDetectionService } from "@/services/trimestre-detection.service";

export async function GET() {
  try {
    console.log("🧪 Probando detección de trimestre...\n");

    const testDates = [
      "27/08/2025 10:28",
      "27/08/2025",
      "26/08/2025",
      "20/08/2025 9:17",
      "15/08/2025 10:15",
    ];

    const results = [];

    for (const dateStr of testDates) {
      try {
        const result = await TrimestreDetectionService.detectarTrimestre(
          dateStr
        );

        const testResult = {
          fecha: dateStr,
          trimestre: result.trimestreName,
          valido: result.isValid,
          trimestreId: result.trimestre?.id || null,
          rango: result.trimestre
            ? {
                inicio: result.trimestre.startDate.toISOString().split("T")[0],
                fin: result.trimestre.endDate.toISOString().split("T")[0],
              }
            : null,
          error: result.error || null,
        };

        results.push(testResult);
        console.log(
          `📅 Fecha: ${dateStr} -> Trimestre: ${result.trimestreName}`
        );
      } catch (error) {
        const errorResult = {
          fecha: dateStr,
          error: error instanceof Error ? error.message : "Error desconocido",
          valido: false,
        };
        results.push(errorResult);
        console.log(`❌ Error procesando ${dateStr}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Prueba completada",
    });
  } catch (error) {
    console.error("Error en prueba:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
