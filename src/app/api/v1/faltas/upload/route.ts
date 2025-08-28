import { NextRequest, NextResponse } from "next/server";
import { CSVProcessingService } from "@/services/csv-processing.service";
import { UploadResponse } from "@/types/csv-import";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const duplicateHandling = formData.get("duplicateHandling") as string;
    const tipoFalta = formData.get("tipoFalta") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (!tipoFalta) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe seleccionar el tipo de falta (Tipo I, II o III)",
        },
        { status: 400 }
      );
    }

    // Validar que el tipo de falta sea válido
    const tiposFaltaValidos = ["Tipo I", "Tipo II", "Tipo III"];
    if (!tiposFaltaValidos.includes(tipoFalta)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tipo de falta no válido. Debe ser 'Tipo I', 'Tipo II' o 'Tipo III'",
        },
        { status: 400 }
      );
    }

    // Validar formato de archivo
    const formatValidation = CSVProcessingService.validateFileFormat(file);
    if (!formatValidation.valid) {
      return NextResponse.json(
        { success: false, error: formatValidation.error },
        { status: 400 }
      );
    }

    // Leer contenido del archivo
    const content = await file.text();

    // Procesar usando el servicio
    const result = await CSVProcessingService.processCSVFile(
      content,
      tipoFalta,
      duplicateHandling ? JSON.parse(duplicateHandling) : undefined
    );

    const response: UploadResponse = {
      success: true,
      result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
