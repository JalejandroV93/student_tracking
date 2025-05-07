// 5. components/auth/AnimatedLogo.tsx - Componente para el logo animado

import { motion } from "framer-motion"
import { APPLogo } from "@/components/ui/app_logo"

interface AnimatedLogoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logoControls: any
}

export function AnimatedLogo({ logoControls }: AnimatedLogoProps) {
  return (
    <motion.div 
      className="absolute bottom-4 z-10"
      initial={{ opacity: 0, right: "16px" }}
      animate={logoControls}
    >
      <APPLogo />
    </motion.div>
  )
}