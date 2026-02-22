import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import AppLayout from "@/components/layout/AppLayout";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const BotList = lazy(() => import("@/pages/BotList"));
const BotSettings = lazy(() => import("@/pages/BotSettings"));
const BotEditor = lazy(() => import("@/pages/BotEditor"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));

function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-mesh">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bots" element={<BotList />} />
          <Route path="/bots/:botId" element={<BotSettings />} />
          <Route path="/bots/:botId/editor" element={<BotEditor />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
