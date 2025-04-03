"use client";
// Importar el router correcto para App Router
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  // Usar useEffect para redirigir
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
    </div>
  );
}
