import { NextResponse } from "next/server";
import { convertCSVRowToFalta } from "@/lib/csv-utils";

export async function GET() {
  try {
    // Simular una fila del CSV de ejemplo
    const mockRow = {
      Id: "8898",
      Código: "3314",
      Persona: "Ramírez Hurtado Diego Alejandro",
      Sección: "Décimo Segundo A",
      "Fecha De Creación": "27/08/2025 10:28",
      Autor:
        "Castro Escobar (Homeroom Teacher 8A   Artes Visuales 7-12) Angely Xiomara",
      "Fecha última Edición": "27/08/2025 10:28",
      "último Editor":
        "Castro Escobar (Homeroom Teacher 8A   Artes Visuales 7-12) Angely Xiomara",
      "Fecha ": "26/08/2025", // Campo con espacio (formato real del CSV)
      "Estudiante con diagnostico?": "No",
      "Falta segun Manual de Convivencia":
        "3.Incumplimiento con el reglamento interno sobre el manejo de elementos electrónicos dentro del colegio (capítulo 3 de este Manual)",
      "Descripcion de la falta":
        "El estudiante estaba usando el celular de su compañero Kaito en la clase.",
      "Acciones Reparadoras":
        "socializar con el grupo sobre la importancia de acatar las normas de clase",
      "Acta de Descargos": "",
    };

    console.log("🧪 Procesando fila de prueba del CSV...");
    console.log("📅 Fecha De Creación:", mockRow["Fecha De Creación"]);
    console.log("📅 Fecha :", mockRow["Fecha "]);

    // Procesar la falta (usando studentId ficticio 123)
    const resultado = await convertCSVRowToFalta(mockRow, 123, "Disciplinaria");

    if (resultado) {
      return NextResponse.json({
        success: true,
        message: "Falta procesada exitosamente",
        data: {
          fecha: resultado.fecha?.toISOString(),
          trimestre: resultado.trimestre,
          trimestre_id: resultado.trimestre_id,
          school_year_id: resultado.school_year_id,
          fechaCreacion: resultado.fecha_creacion?.toISOString(),
          hash: resultado.hash,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "No se pudo procesar la falta",
      });
    }
  } catch (error) {
    console.error("❌ Error procesando falta:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
