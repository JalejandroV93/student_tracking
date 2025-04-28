import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      receivedPayload: body,
      message: "Este es un endpoint de prueba para debugging",
    });
  } catch (error) {
    console.error("Error en endpoint de prueba:", error);
    return NextResponse.json(
      { error: "Error en la ruta de prueba" },
      { status: 500 }
    );
  }
}
