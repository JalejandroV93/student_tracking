/* eslint-disable @typescript-eslint/no-explicit-any */
//src/app/api/v1/auth/sso/route.ts

import { handleSSOLogin } from "@/lib/auth";
import { createToken } from "@/lib/tokens";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Extract the JWT token from the request body
    const { jwt: jwtToken } = await request.json();

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Token JWT no proporcionado" },
        { status: 400 }
      );
    }

    try {
      // Handle SSO login/registration
      const userPayload = await handleSSOLogin(jwtToken);
      
      // Si llegamos aquí, la cuenta no está bloqueada
      // Create a new token for our app
      const token = await createToken(userPayload);

      // Set token in cookies
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({ success: true });
      
    } catch (e: any) {
      // Específicamente cachear el error de cuenta bloqueada
      if (e.message === "Cuenta bloqueada temporalmente") {
        return NextResponse.json(
          { error: "cuenta bloqueada" },
          { status: 403 }
        );
      }
      
      // Otros errores de autenticación
      return NextResponse.json(
        { error: e.message || "Error en autenticación SSO" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("SSO request processing error:", error);
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}