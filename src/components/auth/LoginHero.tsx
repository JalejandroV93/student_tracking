// components/auth/LoginHero.tsx - Hero section con logo e imagen inspiracional
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { useEffect, useState } from "react";
import type { Quote, QuoteResponse } from "@/types/quote";
import { Skeleton } from "../ui/skeleton";

export function LoginHero() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch quote of the day from our backend API
    fetch("/api/v1/quote-of-the-day")
      .then((res) => res.json())
      .then((response: QuoteResponse) => {
        if (response.success && response.data) {
          setQuote({
            content: response.data.content,
            author: response.data.author,
          });
        }
      })
      .catch((error) => console.error("Error fetching quote:", error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="hidden lg:block relative w-full h-full min-h-screen lg:min-h-full tracking-tight overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bg-tracking2.webp"
          alt="Background"
          fill
          objectFit="cover"
          className="object-contain"
          priority
        />
      </div>

      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Logo y título en esquina superior izquierda */}
      <div className="relative z-10 px-8 lg:px-12 pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <Logo className="w-16 h-16 lg:w-20 lg:h-20 hidden" />
          <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
            Seguimiento de Faltas
          </h2>
        </motion.div>
      </div>

      {/* Frase del día en el footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 lg:px-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl"
        >
          {isLoading ? (
            <div className="text-white/80 italic text-sm">
              <Skeleton className="h-4 w-full max-w-lg mb-2" />
            </div>
          ) : quote ? (
            <blockquote className="border-l-4 border-white/30 pl-4">
              <p className="text-white/90 italic text-base lg:text-lg mb-2">
                &ldquo;{quote.content}&rdquo;
              </p>
              <footer className="text-white/60 text-sm">
                — {quote.author}
              </footer>
            </blockquote>
          ) : null}
        </motion.div>
      </div>

      {/* Meteors effect */}
    </div>
  );
}
