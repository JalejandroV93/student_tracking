import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test de parsing de fechas
    const testDates = ["27/08/2025 10:28", "26/08/2025", "20/08/2025 9:17"];

    const results = testDates.map((dateStr) => {
      console.log(`🧪 Procesando fecha: ${dateStr}`);

      // Lógica de parsing actualizada (como en trimestre-detection.service.ts)
      const fechaSinHora = dateStr.trim().split(" ")[0];
      const partes = fechaSinHora.split("/");

      if (partes.length === 3) {
        const day = parseInt(partes[0], 10);
        const month = parseInt(partes[1], 10);
        const year = parseInt(partes[2], 10);

        // Crear fecha como DD/MM/YYYY
        const parsedDate = new Date(year, month - 1, day);

        return {
          original: dateStr,
          fechaSinHora,
          partes: { day, month, year },
          parsedDate: parsedDate.toISOString(),
          readableDate: parsedDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        };
      }

      return {
        original: dateStr,
        error: "Formato inválido",
      };
    });

    // Simular la lógica de detección de trimestre
    const trimesterRanges = [
      {
        name: "Primer Trimestre",
        start: new Date("2025-08-11"),
        end: new Date("2025-11-12"),
      },
      {
        name: "Segundo Trimestre",
        start: new Date("2025-11-13"),
        end: new Date("2026-03-06"),
      },
      {
        name: "Tercer Trimestre",
        start: new Date("2026-03-07"),
        end: new Date("2026-06-12"),
      },
    ];

    const detectionResults = results.map((result) => {
      if (result.parsedDate) {
        const testDate = new Date(result.parsedDate);
        const matchingTrimester = trimesterRanges.find(
          (t) => testDate >= t.start && testDate <= t.end
        );

        return {
          ...result,
          detectedTrimester: matchingTrimester?.name || "No detectado",
          isAugust2025:
            testDate.getFullYear() === 2025 && testDate.getMonth() === 7, // Agosto es mes 7 (0-based)
        };
      }
      return result;
    });

    return NextResponse.json({
      success: true,
      message: "Prueba de parsing completada",
      results: detectionResults,
      analysis: {
        message:
          "Todas las fechas de agosto 2025 deberían estar en el Primer Trimestre",
        note: "Si están apareciendo en el Segundo Trimestre, hay un problema de configuración",
      },
    });
  } catch (error) {
    console.error("❌ Error en prueba:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
