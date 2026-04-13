import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "@/components/LanguageToggle";
import AppFooter from "@/components/AppFooter";
import TrialBanner from "@/components/TrialBanner";
import TestingModePanel from "@/components/TestingModePanel";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import type { Language } from "@/types/clinical";

interface AppLayoutProps {
  children: React.ReactNode;
  language: Language;
  onLanguageChange: (l: Language) => void;
  isOnline: boolean;
  pendingCount: number;
  onSync: () => void;
}

const AppLayout = ({ children, language, onLanguageChange }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const trial = useTrialStatus();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-2.5">
                <SidebarTrigger className="mr-1" />
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground leading-tight">ShadowMD</h1>
                  <p className="text-[10px] text-muted-foreground leading-none">AI Clinical Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrialBanner trial={trial} />
                <TestingModePanel />
                <LanguageToggle language={language} onChange={onLanguageChange} />
                <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
