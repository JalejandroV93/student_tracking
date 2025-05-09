import type { Metadata } from "next";
import "@/styles/globals.css";
import { Poppins } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Seguimiento Faltas LTSM",
  description: "Sistema de Alertas en Faltas para estudiantes del LTSM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <meta name="apple-mobile-web-app-title" content="Artemisa" />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body className={cn(poppins.className, "min-h-screen")}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
