import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="w-screen h-screen bg-[#171615] text-white">
      <main className="relative h-full overflow-y-auto overscroll-none [transform:translateZ(0)] [backface-visibility:hidden] will-change-scroll">
        <Outlet />
      </main>
    </div>
  );
}
