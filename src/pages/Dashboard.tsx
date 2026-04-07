import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Users, History, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import TrialBanner from "@/components/TrialBanner";
import { useTrialStatus } from "@/hooks/useTrialStatus";

const Dashboard = () => {
  const navigate = useNavigate();
  const trial = useTrialStatus();
  const [stats, setStats] = useState({ patients: 0, consultations: 0, highRisk: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [pRes, cRes] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("consultations").select("id, analysis", { count: "exact" }),
      ]);
      const consultations = cRes.data || [];
      const highRisk = consultations.filter((c: any) => (c.analysis as any)?.emergency_level === "HIGH RISK").length;
      setStats({
        patients: pRes.count || 0,
        consultations: cRes.count || 0,
        highRisk,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Patients", value: stats.patients, icon: Users, color: "text-primary" },
    { label: "Consultations", value: stats.consultations, icon: History, color: "text-primary" },
    { label: "High Risk Cases", value: stats.highRisk, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="container px-4 py-4 md:py-6 space-y-6">
      <TrialBanner trial={trial} />

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your clinical practice</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={() => navigate("/consultation")} className="h-auto py-4 gap-2" size="lg">
          <Stethoscope className="h-5 w-5" />
          New Consultation
        </Button>
        <Button onClick={() => navigate("/patients")} variant="outline" className="h-auto py-4 gap-2" size="lg">
          <Users className="h-5 w-5" />
          Manage Patients
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
