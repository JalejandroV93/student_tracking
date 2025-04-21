"use client";

import { Sidebar } from "@/components/admin-panel/sidebar";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { getOpenState, settings } = sidebar;

  return (
    <ReactQueryProvider>
      <>
        <Sidebar />
        <main
          className={cn(
            "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
            !settings.disabled &&
              (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
          )}
        >
          {children}
        </main>
        <footer
          className={cn(
            "transition-[margin-left] ease-in-out duration-300",
            !settings.disabled &&
              (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72")
          )}
        >
          <div className="w-full border-t p-3 flex justify-center items-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LTSM
            </p>
          </div>
        </footer>
        <Toaster />
      </>
    </ReactQueryProvider>
  );
}
