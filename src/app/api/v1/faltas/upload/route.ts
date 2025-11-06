import { NextRequest, NextResponse } from "next/server";
import { CSVProcessingService } from "@/services/csv-processing.service";
import { UploadResponse } from "@/types/csv-import";
import { getCurrentUser } from "@/lib/session";
import { auditService } from "@/services/audit.service";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const duplicateHandling = formData.get("duplicateHandling") as string;
    const tipoFalta = formData.get("tipoFalta") as string;
    const trimestreId = formData.get("trimestreId") as string;

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

    if (!trimestreId) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe seleccionar un trimestre",
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
      parseInt(trimestreId),
      duplicateHandling ? JSON.parse(duplicateHandling) : undefined
    );

    // Log import
    await auditService.logImport(
      user.id,
      user.username,
      `faltas_csv_${tipoFalta}`,
      result.created ?? 0,
      result.updated ?? 0,
      result.errors.length,
      request
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
