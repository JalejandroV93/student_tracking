import { Casos } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";


// Endpoint para diagnosticar problemas con faltas y casos
export async function GET(request: Request) {
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

    // 2. Buscar el caso por hash_falta
    const caso = await prisma.casos.findFirst({
      where: {
        hash_falta: infractionId,
      },
    });

    // 3. Buscar todos los casos para esta falta (si existe)
    let casosPorFalta: Casos[] = [];
    if (falta) {
      casosPorFalta = await prisma.casos.findMany({
        where: {
          hash_falta: falta.hash,
        },
      });
    }

    // 4. Obtener algunos ejemplos de faltas y casos
    const ejemploFaltas = await prisma.faltas.findMany({
      take: 3,
      select: {
        hash: true,
        tipo_falta: true,
        numero_falta: true,
      },
    });

    const ejemploCasos = await prisma.casos.findMany({
      take: 3,
      select: {
        id_caso: true,
        hash_falta: true,
      },
    });

    // Devolver todos los datos de diagnóstico
    return NextResponse.json({
      infractionIdBuscado: infractionId,
      faltaEncontrada: falta
        ? {
            hash: falta.hash,
            tipo_falta: falta.tipo_falta,
            numero_falta: falta.numero_falta,
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
      ejemploCasos,
      mensaje: falta
        ? caso
          ? "Se encontraron tanto la falta como el caso"
          : "Se encontró la falta pero no el caso asociado"
        : caso
        ? "No se encontró la falta pero sí un caso con ese hash"
        : "No se encontró ni la falta ni el caso",
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    return NextResponse.json(
      {
        error: "Error realizando el diagnóstico",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
