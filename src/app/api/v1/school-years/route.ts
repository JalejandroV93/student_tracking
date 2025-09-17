import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateSchoolYearRequest } from "@/types/school-year";

export async function GET() {
  try {
    const schoolYears = await prisma.schoolYear.findMany({
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ success: true, data: schoolYears });
  } catch (error) {
    console.error("Error fetching school years:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSchoolYearRequest = await request.json();

    // Validaciones
    if (
      !body.name ||
      !body.startDate ||
      !body.endDate ||
      !body.trimestres ||
      body.trimestres.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos. Se requiere nombre, fechas y trimestres.",
        },
        { status: 400 }
      );
    }

    if (body.trimestres.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Se requieren exactamente 3 trimestres." },
        { status: 400 }
      );
    }

    // Validar que los trimestres tengan orders únicos
    const orders = body.trimestres.map(t => t.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      return NextResponse.json(
        { success: false, error: "Los trimestres deben tener órdenes únicos." },
        { status: 400 }
      );
    }

    // Validar que los orders sean 1, 2, 3
    const expectedOrders = [1, 2, 3];
    if (!expectedOrders.every(order => orders.includes(order))) {
      return NextResponse.json(
        { success: false, error: "Los trimestres deben tener órdenes 1, 2 y 3." },
        { status: 400 }
      );
    }
    
    // Verificar que no exista un año escolar con el mismo nombre
    const existingSchoolYear = await prisma.schoolYear.findUnique({
      where: { name: body.name },
    });

    if (existingSchoolYear) {
      return NextResponse.json(
        { success: false, error: "Ya existe un año escolar con ese nombre." },
        { status: 400 }
      );
    }

    // Usar transacción para crear el año escolar con sus trimestres
    const schoolYear = await prisma.$transaction(async (tx) => {
      // Crear el año escolar primero
      const newSchoolYear = await tx.schoolYear.create({
        data: {
          name: body.name,
          phidias_id: body.phidias_id,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          description: body.description,
          isActive: false, // Por defecto no está activo
        },
      });

      console.log('Created school year with ID:', newSchoolYear.id);

      // Preparar datos de trimestres con validación adicional
      const trimestresData = body.trimestres.map((trimestre, index) => {
        console.log(`Processing trimestre ${index + 1}:`, {
          name: trimestre.name,
          order: trimestre.order,
          schoolYearId: newSchoolYear.id
        });
        
        return {
          schoolYearId: newSchoolYear.id,
          name: trimestre.name,
          order: trimestre.order,
          startDate: new Date(trimestre.startDate),
          endDate: new Date(trimestre.endDate),
        };
      });

      // Crear trimestres individualmente para mejor control de errores
      for (const trimestreData of trimestresData) {
        try {
          await tx.trimestre.create({
            data: trimestreData,
          });
          console.log('Created trimestre:', trimestreData.name, 'order:', trimestreData.order);
        } catch (error) {
          console.error('Error creating trimestre:', trimestreData, error);
          throw error;
        }
      }

      // Obtener el año escolar completo con sus trimestres
      return await tx.schoolYear.findUnique({
        where: { id: newSchoolYear.id },
        include: {
          trimestres: {
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: schoolYear,
      message: "Año escolar creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating school year:", error);
    
    let errorMessage = "Error interno del servidor";
    
    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      
      if (prismaError.code === 'P2002') {
        if (prismaError.meta?.target?.includes('name')) {
          errorMessage = "Ya existe un año escolar con ese nombre";
        } else if (prismaError.meta?.target?.includes('unique_school_year_trimester')) {
          errorMessage = "Error de duplicación en trimestres. Verifica que los órdenes sean únicos.";
        } else {
          errorMessage = "Error de restricción única en la base de datos";
        }
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
