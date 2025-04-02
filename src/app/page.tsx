// src/app/dashboard/page.tsx
"use client";
//importar el router de next para redirigir a /dashboard
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  //redirigir a /dashboard
  router.push("/dashboard");
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
      
    </div>
  );
}