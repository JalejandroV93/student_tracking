// Script de prueba para verificar la detección de trimestre
import { TrimestreDetectionService } from "./src/services/trimestre-detection.service.ts";

async function testTrimestreDetection() {
  console.log("🧪 Probando detección de trimestre...\n");

  const testDates = [
    "27/08/2025 10:28",
    "27/08/2025",
    "26/08/2025",
    "20/08/2025 9:17",
    "15/08/2025 10:15",
  ];

  for (const dateStr of testDates) {
    try {
      const result = await TrimestreDetectionService.detectarTrimestre(dateStr);
      console.log(`📅 Fecha: ${dateStr}`);
      console.log(`   Trimestre: ${result.trimestreName}`);
      console.log(`   Válido: ${result.isValid}`);
      if (result.trimestre) {
        console.log(`   ID Trimestre: ${result.trimestre.id}`);
        console.log(
          `   Rango: ${
            result.trimestre.startDate.toISOString().split("T")[0]
          } - ${result.trimestre.endDate.toISOString().split("T")[0]}`
        );
      }
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      console.log("");
    } catch (error) {
      console.log(`❌ Error procesando ${dateStr}:`, error.message);
      console.log("");
    }
  }
}

testTrimestreDetection().catch(console.error);
