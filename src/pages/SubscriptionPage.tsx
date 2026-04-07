import { useNavigate } from "react-router-dom";
import { Crown, Calendar, Clock, Shield, Stethoscope, History, BarChart3, Receipt, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const SubscriptionPage = () => {
  const trial = useTrialStatus();
  const { initiatePayment } = useRazorpay(() => window.location.reload());
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState({ consultations: 0, patients: 0 });
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [cRes, pRes, payRes] = await Promise.all([
        supabase.from("consultations").select("id", { count: "exact", head: true }),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setUsageStats({
        consultations: cRes.count || 0,
        patients: pRes.count || 0,
      });
      setPayments(payRes.data || []);
    };
    fetchData();
  }, [user]);

  const statusConfig = {
    active: { label: "Active", className: "bg-success/20 text-success border-success/30" },
    trial: { label: "Trial", className: "bg-warning/20 text-warning border-warning/30" },
    expired: { label: "Expired", className: "bg-destructive/20 text-destructive border-destructive/30" },
  };

  const status = statusConfig[trial.planStatus] || statusConfig.expired;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const expiryMessage = () => {
    if (trial.planStatus === "expired") return "Your subscription has expired. Renew to continue using ShadowMD.";
    if (trial.planStatus === "trial") return `Free trial ends in ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""}`;
    if (trial.daysRemaining <= 3) return `⚠️ Your plan expires in ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""}. Renew now.`;
    return `Your plan is active and expires in ${trial.daysRemaining} days`;
  };

  const progressPercent = trial.planStatus === "expired" ? 100 : Math.max(0, Math.min(100, ((30 - trial.daysRemaining) / 30) * 100));

  if (trial.loading) {
    return (
      <div className="container px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 md:py-6 space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Subscription</h2>
        <p className="text-sm text-muted-foreground">Manage your ShadowMD Pro plan</p>
      </div>

      {/* Expiry Warning Banner */}
      {(trial.planStatus === "expired" || (trial.daysRemaining <= 3)) && (
        <div className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${
          trial.planStatus === "expired"
            ? "bg-destructive/10 border-destructive/30"
            : "bg-warning/10 border-warning/30"
        }`}>
          <p className={`text-sm font-medium ${
            trial.planStatus === "expired" ? "text-destructive" : "text-warning"
          }`}>
            {trial.planStatus === "expired" ? "🔴 Your subscription has expired. Renew to continue." : `⚠️ Your subscription will expire in ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""}. Renew now.`}
          </p>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={initiatePayment}>
            <Crown className="h-3.5 w-3.5" />
            Renew Now
          </Button>
        </div>
      )}

      {/* Plan Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              ShadowMD Pro
            </CardTitle>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{expiryMessage()}</p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Plan usage</span>
              <span>{trial.daysRemaining} days remaining</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  trial.planStatus === "expired"
                    ? "bg-destructive"
                    : trial.daysRemaining <= 3
                    ? "bg-warning"
                    : "bg-success"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Plan details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(trial.startDate ?? null)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Expiry Date
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDate(trial.expiryDate)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            {trial.planStatus === "trial" && (
              <Button className="w-full gap-2" onClick={initiatePayment}>
                <Crown className="h-4 w-4" />
                Upgrade Plan — ₹1,499/mo
              </Button>
            )}
            {trial.planStatus === "expired" && (
              <Button className="w-full gap-2" onClick={initiatePayment}>
                <Crown className="h-4 w-4" />
                Renew Subscription — ₹1,499/mo
              </Button>
            )}
            {trial.isPremium && trial.daysRemaining <= 7 && (
              <Button className="w-full gap-2" onClick={initiatePayment}>
                <Crown className="h-4 w-4" />
                Renew Early — ₹1,499/mo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Stethoscope, label: "Unlimited Consultations" },
              { icon: Shield, label: "Image Diagnosis" },
              { icon: History, label: "Full History Access" },
              { icon: BarChart3, label: "Learning Mode" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 rounded-lg bg-muted/50 p-3">
                <div className="h-8 w-8 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Usage Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">{usageStats.consultations}</p>
              <p className="text-xs text-muted-foreground">Consultations</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">{usageStats.patients}</p>
              <p className="text-xs text-muted-foreground">Patients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      p.status === "success" ? "bg-success/15" : "bg-destructive/15"
                    }`}>
                      {p.status === "success" ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        ₹{(p.amount / 100).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {p.razorpay_payment_id || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[10px] ${
                      p.status === "success"
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }`}>
                      {p.status === "success" ? "Success" : "Failed"}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
