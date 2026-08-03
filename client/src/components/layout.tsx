import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="w-screen h-screen flex flex-col bg-[#171615] overflow-hidden text-white">
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
