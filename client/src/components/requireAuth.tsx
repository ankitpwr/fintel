import { Navigate, Outlet } from "react-router";
import { useEffect } from "react";
import useUserStore from "@/store/useUserStore";
import { toast } from "./ui/toast";
import { ThinkingOrb } from "thinking-orbs";

export default function RequireAuth() {
  const { isAuthenticated, hasCheckedAuth } = useUserStore();

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      toast.add({ type: "error", description: "Unauthorized user" });
    }
  }, [hasCheckedAuth, isAuthenticated]);

  if (!hasCheckedAuth) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <ThinkingOrb state="shaping" size={64} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
