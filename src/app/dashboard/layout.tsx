"use client";

import { SidebarProvider } from "@/components/ui/sidebar"; // Make sure path is correct
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"; // Make sure path is correct
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner"; // Import Sonner Toaster
import ReactQueryProvider from "@/providers/ReactQueryProvider";
interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // No more activePage state needed here
  return (
    <ReactQueryProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          {/* Sidebar no longer needs activePage props */}
          <DashboardSidebar />
          {/* Content is rendered directly by the page files */}
          <main className="p-2 flex-1">{children}</main>
          {/* Add Sonner Toaster here for global notifications */}
          <Toaster />
        </div>
      </SidebarProvider>
    </ReactQueryProvider>
  );
}