// src/lib/tokens.ts (JWT handling using jose)

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { config } from './config';

// Function to create the token
export const createToken = async (payload: JWTPayload): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // Agrega la marca de tiempo "iat"
    .setExpirationTime('1d') // 1 day expiration
    .sign(new TextEncoder().encode(config.authSecret));
};

export const verifyToken = async <T extends JWTPayload>(token: string): Promise<T> => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(config.authSecret));
    
    // Validación adicional del token: comprobar la antigüedad basada en "iat"
    const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const maxAge = 60 * 60 * 24; // Umbral de 24 horas (puedes ajustar este valor)
    
    if (payload.iat && (now - payload.iat > maxAge)) {
      throw new Error("Token expirado, renovarlo");
    }
    
    return payload as T;
  } catch (error) {
    console.error("Error al verificar el token:", error);
    throw new Error('Token inválido');
  }
};
