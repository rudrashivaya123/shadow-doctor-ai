import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback } from "react";
import { TestingModeProvider } from "@/contexts/TestingModeContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewConsultation from "./pages/NewConsultation";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import ConsultationDetail from "./pages/ConsultationDetail";
import HistoryPage from "./pages/HistoryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ContactPage from "./pages/ContactPage";
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
    <TestingModeProvider>
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
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Routes>
      </AppLayout>
    </TestingModeProvider>
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

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isDemoUser } = useAuth();
  if (loading) return null;
  if (user && !isDemoUser) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><ProtectedApp /></ProtectedRoute>} />
          {/* Redirect old paths */}
          <Route path="/consultation" element={<Navigate to="/dashboard/consultation" replace />} />
          <Route path="/consultation/:id" element={<Navigate to="/dashboard/consultation/:id" replace />} />
          <Route path="/patients" element={<Navigate to="/dashboard/patients" replace />} />
          <Route path="/patients/:id" element={<Navigate to="/dashboard/patients/:id" replace />} />
          <Route path="/history" element={<Navigate to="/dashboard/history" replace />} />
          <Route path="/subscription" element={<Navigate to="/dashboard/subscription" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
