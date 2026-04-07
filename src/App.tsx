import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewConsultation from "./pages/NewConsultation";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import ConsultationDetail from "./pages/ConsultationDetail";
import HistoryPage from "./pages/HistoryPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import type { Language } from "@/types/clinical";

const queryClient = new QueryClient();

const ProtectedApp = () => {
  const { isOnline, pendingCount, queue } = useOfflineSync();
  const [language, setLanguage] = useState<Language>("en");

  const handleSync = useCallback(() => {
    // Sync handled per-page
  }, []);

  return (
    <AppLayout
      language={language}
      onLanguageChange={setLanguage}
      isOnline={isOnline}
      pendingCount={pendingCount}
      onSync={handleSync}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/consultation" element={<NewConsultation language={language} />} />
        <Route path="/consultation/:id" element={<ConsultationDetail />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AppLayout>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/*" element={<ProtectedRoute><ProtectedApp /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
