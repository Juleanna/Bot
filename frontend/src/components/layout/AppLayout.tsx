import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/api/hooks/useAuth";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const { isLoading } = useProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-mesh">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-mesh">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
