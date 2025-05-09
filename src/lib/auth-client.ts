// src/lib/auth-client.ts (Client-Side Authentication Logic)

import { UserPayload } from "@/types/user";

// Client-side login function.
export const loginClient = async (username: string, password: string): Promise<void> => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error de inicio de sesión");
  }
  // No need to return anything; the cookie is handled by the server.
};


// Client-side logout function.
export const logoutClient = async (): Promise<void> => {
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
  });

  if (response.ok) {
     window.location.href = "/"; //  redirect after logout.
  } else {
    console.error("Error al cerrar sesión");
  }
};

// Client-side function to fetch the current user.
export const fetchUserClient = async (): Promise<UserPayload | null> => {
  const response = await fetch('/api/v1/auth/me');
  if (response.ok) {
    return await response.json();
  } else {
    return null; // No authenticated user.
  }
};


// Client-side function to initiate SSO login by redirecting.
export const initiateSSOLogin = () => {
    // Directly redirect to the SSO endpoint on the server.
    window.location.href = '/api/v1/auth/sso'; // This will handle the query parameter
};