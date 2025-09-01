// 6. app/page.tsx - Página principal refactorizada
"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { useResponsiveAnimation } from "@/hooks/useResponsiveAnimation"
import { LoginForm } from "@/components/auth/LoginForm"
import { LoginHeader } from "@/components/auth/LoginHeader"
//import { BorderBeam } from "@/components/magicui/border-beam";

export default function LoginPage() {
  const { controls } = useResponsiveAnimation()
  return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">

          {/* Content */}
          <motion.div
              initial={{ y: 0 }}
              animate={controls}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md rounded-xl shadow-md z-10"
          >
              <Card className="relative overflow-hidden border-none">
                  <LoginHeader />
                  <LoginForm />
                  {/* <BorderBeam
                      duration={6}
                      size={100}
                  /> */}
                  
              </Card>
          </motion.div>

      </div>
  );
}