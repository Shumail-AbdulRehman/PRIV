import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="min-h-screen lg:pl-[280px]">
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">CleanOps</p>
              <p className="text-sm font-medium text-foreground">Operations hub</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <Outlet />
        </div>
      </main>
    </div>
  );
}
