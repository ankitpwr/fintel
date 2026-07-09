import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./appSidebar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#171615] overflow-hidden">
      {" "}
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
