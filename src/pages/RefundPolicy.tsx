import { Link } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const RefundPolicy = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <header className="border-b border-border/40">
      <div className="max-w-5xl mx-auto flex items-center gap-2.5 h-14 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="text-base font-bold">ShadowMD</span>
        </Link>
      </div>
    </header>
    <main className="flex-1 max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <h1 className="text-3xl font-bold">Refund Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 7, 2026</p>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>We want you to be satisfied with ShadowMD. This policy outlines our refund process.</p>
        <h2 className="text-lg font-semibold text-foreground">Eligibility</h2>
        <p>Refund requests must be made within 7 days of purchase. Refunds are available for subscription payments only and are not applicable to consumed AI analysis credits.</p>
        <h2 className="text-lg font-semibold text-foreground">How to Request a Refund</h2>
        <p>Contact us at <a href="mailto:support@shadowmd.com" className="text-primary hover:underline">support@shadowmd.com</a> with your account email, payment details, and reason for the refund request.</p>
        <h2 className="text-lg font-semibold text-foreground">Processing</h2>
        <p>Approved refunds will be processed within 5–7 business days and credited to the original payment method.</p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default RefundPolicy;
