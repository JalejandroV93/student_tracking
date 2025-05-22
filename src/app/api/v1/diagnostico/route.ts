import { Casos, PrismaClient, Role, Faltas } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Endpoint para diagnosticar problemas con faltas y casos
export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const infractionId = searchParams.get("infractionId");

  if (!infractionId) {
    return NextResponse.json(
      { error: "Debe proporcionar el parámetro infractionId" },
      { status: 400 }
    );
  }

  try {
    // 1. Buscar la falta por hash (el hash es el ID primario)
    const falta = await prisma.faltas.findUnique({
      where: {
        hash: infractionId,
      },
    });

    let permittedAreaNames: string[] = []; // Initialize to empty array

    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.PSYCHOLOGY
    ) {
      const userPermissions = await prisma.areaPermissions.findMany({
        where: { userId: currentUser.id, canView: true },
        include: { area: true },
      });
      permittedAreaNames = userPermissions.map(
        (permission) => permission.area.name
      );

      if (falta) {
        if (
          !falta.nivel ||
          !permittedAreaNames.includes(falta.nivel)
        ) {
          return NextResponse.json(
            { error: "Acceso denegado a esta infracción." },
            { status: 403 }
          );
        }
      }
      // If falta is null, we let it proceed, the final response will indicate it wasn't found.
      // If a restricted user has no permitted areas, they won't be able to see specific infractions
      // and example data will be filtered accordingly.
    }
    
    // Initialize variables for data that depends on 'falta'
    let caso = null;
    let casosPorFalta: Casos[] = [];

    if (falta) {
      // 2. Buscar el caso por hash_falta (only if falta exists and is authorized)
      caso = await prisma.casos.findFirst({
        where: {
          hash_falta: infractionId,
        },
      });

      // 3. Buscar todos los casos para esta falta (si existe y is authorized)
      casosPorFalta = await prisma.casos.findMany({
        where: {
          hash_falta: falta.hash,
        },
      });
    }

    // 4. Obtener algunos ejemplos de faltas y casos, filtered by permissions
    let ejemploFaltas: Partial<Faltas>[] = [];
    let ejemploCasosData: Partial<Casos>[] = []; // Renamed to avoid conflict with 'caso' variable

    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.PSYCHOLOGY
    ) {
      ejemploFaltas = await prisma.faltas.findMany({
        take: 3,
        select: {
          hash: true,
          tipo_falta: true,
          numero_falta: true,
          nivel: true,
        },
      });
      ejemploCasosData = await prisma.casos.findMany({
        take: 3,
        select: {
          id_caso: true,
          hash_falta: true,
        },
      });
    } else {
      if (permittedAreaNames.length > 0) {
        ejemploFaltas = await prisma.faltas.findMany({
          where: { nivel: { in: permittedAreaNames } },
          take: 3,
          select: {
            hash: true,
            tipo_falta: true,
            numero_falta: true,
            nivel: true,
          },
        });
        ejemploCasosData = await prisma.casos.findMany({
          where: { falta: { nivel: { in: permittedAreaNames } } },
          take: 3,
          select: {
            id_caso: true,
            hash_falta: true,
          },
        });
      }
      // If permittedAreaNames is empty, ejemploFaltas and ejemploCasosData remain []
    }

    // Devolver todos los datos de diagnóstico
    return NextResponse.json({
      infractionIdBuscado: infractionId,
      faltaEncontrada: falta
        ? {
            hash: falta.hash,
            tipo_falta: falta.tipo_falta,
            numero_falta: falta.numero_falta,
            nivel: falta.nivel, // Include nivel for context
          }
        : null,
      casoEncontrado: caso
        ? {
            id_caso: caso.id_caso,
            hash_falta: caso.hash_falta,
          }
        : null,
      casosPorFalta,
      ejemploFaltas,
      ejemploCasos: ejemploCasosData, // Use the renamed variable
      mensaje: falta
        ? caso
          ? "Se encontraron tanto la falta como el caso"
          : "Se encontró la falta pero no el caso asociado"
        : caso // This case might be less likely now due to sequential fetching
        ? "No se encontró la falta pero sí un caso con ese hash (revisar lógica)"
        : "No se encontró ni la falta ni el caso",
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    let errorMessage = "Error realizando el diagnóstico";
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: errorMessage,
        details: (error as Error).message, // Keep original detail for debugging if needed
      },
      { status: 500 }
    );
  }
}
