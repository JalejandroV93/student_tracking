// 6. app/page.tsx - Página principal refactorizada
"use client";

import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginHero } from "@/components/auth/LoginHero";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column: Logo + Hero Image (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:block">
          <LoginHero />
        </div>
        

        {/* Right Column: Login Form */}
        <div className="flex items-center justify-center  px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl"
          >
            <LoginHeader />
            <LoginForm />
          </motion.div>
        </div>

        {/* Mobile Hero (Shown only on mobile below the form) */}
        <div className="lg:hidden min-h-[400px]">
          <LoginHero />
        </div>
      </div>
    </div>
  );
}
