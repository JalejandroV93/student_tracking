// src/app/api/v1/auth/login/route.ts (Traditional Login)
import { validateCredentials } from "@/lib/auth";
import { createToken } from "@/lib/tokens";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { auditService } from "@/services/audit.service";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Credenciales inválidas", details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    const userPayload = await validateCredentials(username, password);
    const token = await createToken(userPayload);

    // Use cookies() for setting the cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Log successful login
    await auditService.logLogin(userPayload.id, userPayload.username, request);

    return NextResponse.json(
      {
        message: "Inicio de sesión exitoso",
        user: {
          username: userPayload.username,
          rol: userPayload.role,
        },
      },
      { status: 200 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Cuenta bloqueada temporalmente") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 401 }); // Use the caught error message.
  }
}


