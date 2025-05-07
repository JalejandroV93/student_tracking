// 1. hooks/useResponsiveAnimation.ts - Hook personalizado para la lógica de animaciones responsive
"use client"

import { useState, useEffect } from "react"
import { useAnimation } from "framer-motion"

export function useResponsiveAnimation() {
  const [isMobile, setIsMobile] = useState(false)
  const controls = useAnimation()
  const logoControls = useAnimation()

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      if (mobile) {
        logoControls.start({
          x: "50%",
          right: "50%",
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        })
      } else {
        logoControls.start({
          x: 0,
          right: "16px",
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        })
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [logoControls])

  return { isMobile, controls, logoControls }
}