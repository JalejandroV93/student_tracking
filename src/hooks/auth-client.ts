"use client";

import { create } from "zustand";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserPayload } from "@/types/user";

interface SessionStore {
  session: {
    user: UserPayload | null;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (newSession: any) => void;
}

// Store para mantener la sesión del usuario
const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  update: (newSession) => set({ session: newSession }),
}));

// Hook para acceder y actualizar la sesión
export function useSession() {
  const { user } = useAuth();
  const { session, update } = useSessionStore();

  // Si no hay sesión en el store pero hay un usuario autenticado, inicializar
  if (!session && user) {
    update({
      user,
    });
  }

  return {
    session: session || (user ? { user } : null),
    update,
  };
}
