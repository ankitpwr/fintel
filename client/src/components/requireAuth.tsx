import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import useUserStore from "@/store/useUserStore";
import { toast } from "./ui/toast";
import { ThinkingOrb } from "thinking-orbs";

export default function RequireAuth() {
  const { isAuthenticated, hasCheckedAuth } = useUserStore();

  if (!hasCheckedAuth) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <ThinkingOrb state="shaping" size={64} />
      </div>
    );
  }
  if (!isAuthenticated) {
    toast.add({ type: "error", description: "please signin first" });
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
