import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewConsultation from "./pages/NewConsultation";
import EviSmartPage from "./pages/EviSmartPage";
import CopilotPage from "./pages/CopilotPage";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import ConsultationDetail from "./pages/ConsultationDetail";
import HistoryPage from "./pages/HistoryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ContactPage from "./pages/ContactPage";
import SupportPage from "./pages/SupportPage";
import TrialExpired from "./pages/TrialExpired";
import NotFound from "./pages/NotFound";
import type { Language } from "@/types/clinical";

const queryClient = new QueryClient();

const ProtectedApp = () => {
  const { isOnline, pendingCount, queue } = useOfflineSync();
  const [language, setLanguage] = useState<Language>("en");
  const trial = useTrialStatus();

  const handleSync = useCallback(() => {}, []);

  // If trial expired and not premium, show full-screen upgrade
  if (!trial.loading && isFeatureLocked(trial)) {
    return <TrialExpired />;
  }

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
        <Route path="/evismart" element={<EviSmartPage language={language} />} />
        <Route path="/copilot" element={<CopilotPage language={language} />} />
        <Route path="/consultation/:id" element={<ConsultationDetail />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
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

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><ProtectedApp /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
