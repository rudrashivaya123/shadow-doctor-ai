import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback, lazy, Suspense } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import { useTrialExpiredInterceptor } from "@/hooks/useTrialExpiredInterceptor";
import LandingPage from "./pages/LandingPage";
import type { Language } from "@/types/clinical";

// Lazy-load every non-landing route so the public landing ships a much smaller
// initial JS bundle (improves First Contentful Paint).
const Auth = lazy(() => import("./pages/Auth"));
const AppLayout = lazy(() => import("@/components/AppLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewConsultation = lazy(() => import("./pages/NewConsultation"));
const EviSmartPage = lazy(() => import("./pages/EviSmartPage"));
const CopilotPage = lazy(() => import("./pages/CopilotPage"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const ConsultationDetail = lazy(() => import("./pages/ConsultationDetail"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const MedicalDisclaimerPage = lazy(() => import("./pages/MedicalDisclaimerPage"));
const AIDisclaimerPage = lazy(() => import("./pages/AIDisclaimerPage"));
const DataConsentPage = lazy(() => import("./pages/DataConsentPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const ProtectedApp = () => {
  const { isOnline, pendingCount, queue } = useOfflineSync();
  const [language, setLanguage] = useState<Language>("en");
  const trial = useTrialStatus();
  useTrialExpiredInterceptor();

  const handleSync = useCallback(() => {}, []);

  // If trial expired and not premium, send user back to the landing page with upgrade prompt
  if (!trial.loading && isFeatureLocked(trial)) {
    return <Navigate to="/?upgrade=1" replace />;
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
  const trial = useTrialStatus();
  const location = useLocation();
  if (loading || (user && trial.loading)) return null;
  // Logged-in users with expired trial stay on landing to upgrade
  if (user && isFeatureLocked(trial)) return <>{children}</>;
  // Allow explicit upgrade landing even for premium/trial-active users if they navigated here
  if (user && location.pathname === "/" && location.search.includes("upgrade=1")) {
    return <>{children}</>;
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
            <Route path="/ai-disclaimer" element={<AIDisclaimerPage />} />
            <Route path="/data-consent" element={<DataConsentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><ProtectedApp /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
