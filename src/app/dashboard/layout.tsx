"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { useState, ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activePage, setActivePage] = useState<string>("overview");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
        <div className="flex-1 overflow-auto p-4 mx-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}