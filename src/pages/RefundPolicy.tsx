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
      <div className="space-y-5 text-muted-foreground">
        <p>ShadowMD follows a strict subscription-based payment model.</p>
        <p className="font-medium text-foreground">All subscription payments are non-refundable once the service has been accessed or used.</p>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Refund Eligibility</h2>
          <p className="mb-2">Refunds will only be issued under the following conditions:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Duplicate transactions</li>
            <li>Technical errors that prevent access to the service</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Refund Timeline</h2>
          <p>Users must contact support within <strong className="text-foreground">3–5 days</strong> of the transaction to request a refund.</p>
          <p className="mt-1">If approved, refunds will be processed within <strong className="text-foreground">7–10 business days</strong>.</p>
        </div>
        <div className="border-t border-border pt-5 space-y-3">
          <p><span className="font-medium text-foreground">Support Email:</span>{" "}<a href="mailto:support@shadowmd.com" className="text-primary hover:underline">support@shadowmd.com</a></p>
          <p className="text-sm italic">By purchasing a subscription, you agree to this refund policy.</p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default RefundPolicy;
