// Use jose-based functions
import { PhidiasPayload, UserPayload } from "@/types/user";
import { Role } from "@/prismacl/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// src/lib/auth.ts (Server-Side Authentication Logic)

import { prisma } from "./prisma";
import { verifyToken } from "./tokens";
import { auditService } from "@/services/audit.service";

const FAILED_ATTEMPTS_THRESHOLD = 5;
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Validates credentials for traditional login.
export const validateCredentials = async (
  username: string,
  password: string
): Promise<UserPayload> => {
  if (!username || !password) {
    throw new Error("Credenciales incompletas");
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
      role: true,
      isBlocked: true,
      fullName: true,
      document: true,
      failedLoginAttempts: true,
      groupCode: true,
    },
  });

  if (!user) {
    // Security: Hash a dummy string to avoid username enumeration.
    await bcrypt.compare(password, "$2a$10$CwTycUXWue0Thq9StjUM0u"); // Dummy hash
    throw new Error("Credenciales inválidas");
  }

  if (user.isBlocked) {
    throw new Error("Cuenta bloqueada temporalmente");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    // Increment failed login attempts.  Separate update for clarity.
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        isBlocked: {
          set: user.failedLoginAttempts + 1 >= FAILED_ATTEMPTS_THRESHOLD,
        }, // Block if threshold reached.
      },
    });

    // Log failed login attempt
    await auditService.logLoginFailed(
      username,
      updatedUser.isBlocked ? "Cuenta bloqueada por múltiples intentos fallidos" : "Contraseña incorrecta"
    );

    throw new Error("Credenciales inválidas");
  }

  // Reset failed attempts on successful login.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      isBlocked: false,
      lastLogin: new Date()
    },
  });

  // Construct the user payload.  Only include necessary data.
  const userPayload: UserPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName, // Assuming 'nombre' is the full name
    document: user.document,
    groupCode: user.groupCode ?? undefined,
  };

  return userPayload;
};

// Retrieves the currently authenticated user from the cookie (server-side).
export const getCurrentUser = async (): Promise<UserPayload | null> => {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifyToken<UserPayload>(token);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Handles SSO login/registration via JWT.  This is a server-side function.
export const handleSSOLogin = async (
  jwtToken: string
): Promise<UserPayload> => {
  let decodedToken: PhidiasPayload;
  try {
    decodedToken = await verifyToken<PhidiasPayload>(jwtToken);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Token JWT inválido");
  }

  if (!decodedToken || !decodedToken.email) {
    throw new Error("Token JWT inválido o incompleto.");
  }

  // Check if the user already exists.
  let user = await prisma.user.findUnique({
    where: { document: String(decodedToken.email) },
    select: {
      // Select only what you need
      id: true,
      username: true,
      role: true,
      fullName: true,
      document: true,
      isBlocked: true,
    },
  });

  if (!user) {
    // Create the user if they don't exist.  Assume TEACHER role for new SSO users.
    // You might need more sophisticated role logic here.
    user = await prisma.user.create({
      data: {
        username: decodedToken.name, // From JWT
        document: String(decodedToken.email), // Unique identifier from JWT
        fullName: String(decodedToken.name), // Use nombre, fallback to username
        role: "USER", // Default role for new SSO users
        password: await hashPassword(String(decodedToken.email)), // Use document as a temporary password
        lastLogin: new Date(),
        isBlocked: false,
      },
      select: {
        // Same select as above
        id: true,
        username: true,
        role: true,
        fullName: true,
        document: true,
        isBlocked: true,
      },
    });
  }

  if (user.isBlocked) {
    await auditService.logLoginFailed(
      user.username,
      "Cuenta bloqueada"
    );
    throw new Error("Cuenta bloqueada temporalmente");
  }
  // Update lastLogin on every successful SSO login.
  await prisma.user.update({
    where: { document: String(decodedToken.email) },
    data: { lastLogin: new Date() },
  });

  // Log successful SSO login
  await auditService.logLogin(user.id, user.username);

  // Return a consistent user payload.
  return {
    id: user.id,
    username: user.username,
    role: user.role as Role,
    fullName: user.fullName,
    document: user.document,
  };
};
