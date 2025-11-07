// 3. components/auth/LoginHeader.tsx - Componente para el encabezado del login

import { CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"

export function LoginHeader() {
  return (
    <CardHeader className="space-y-2 mb-4">
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <CardTitle className="text-2xl font-bold text-center">Liceo Taller San Miguel</CardTitle>
    </CardHeader>
  )
}
