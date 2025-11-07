import { NextRequest, NextResponse } from "next/server";
import { CSVProcessingService } from "@/services/csv-processing.service";
import { StudentUploadResponse } from "@/types/csv-import";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/prismacl/client";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos (solo ADMIN puede importar estudiantes masivamente)
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para importar estudiantes" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const schoolYearId = formData.get("schoolYearId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (!schoolYearId) {
      return NextResponse.json(
        {
          success: false,
          error: "Debe seleccionar un año académico",
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
    const result = await CSVProcessingService.processStudentCSVFile(
      content,
      parseInt(schoolYearId)
    );

    const response: StudentUploadResponse = {
      success: true,
      result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing student CSV upload:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}