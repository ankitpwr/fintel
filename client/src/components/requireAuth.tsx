import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import useUserStore from "@/store/useUserStore";
import { toast } from "./ui/toast";
import { ThinkingOrb } from "thinking-orbs";

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useUserStore();
  const { userDetails } = useUserStore();

  if (!isAuthenticated && !isLoading) {
    toast.add({ type: "error", description: "please signin first" });
    return <Navigate to="/" />;
  }
  if (isAuthenticated) return <Outlet />;
}
