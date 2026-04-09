import { Link } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const TermsConditions = () => (
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
      <h1 className="text-3xl font-bold">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 7, 2026</p>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>By using ShadowMD, you agree to these Terms &amp; Conditions. Please read them carefully.</p>

        <h2 className="text-lg font-semibold text-foreground">Use of Service</h2>
        <p>ShadowMD is an AI-assisted clinical decision support tool designed for licensed healthcare professionals. It does not replace professional medical judgment, diagnosis, or treatment. All AI-generated outputs are suggestions and must be verified by a qualified medical professional before any clinical action.</p>

        <h2 className="text-lg font-semibold text-foreground">Subscription &amp; Billing</h2>
        <p>ShadowMD Pro is available at ₹1,499/month. New users receive a 3-day free trial with full access to all features. After the trial period, continued access requires an active subscription. Payments are processed securely via Razorpay.</p>

        <h2 className="text-lg font-semibold text-foreground">User Responsibilities</h2>
        <p>You are responsible for the accuracy of information you provide and for all clinical decisions made using the platform. You must maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.</p>

        <h2 className="text-lg font-semibold text-foreground">Cancellation</h2>
        <p>You may cancel your subscription at any time by contacting shadowmd9434@gmail.com. Access will remain active until the end of your current billing period. No partial refunds are provided for unused portions of the subscription period.</p>

        <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
        <p>ShadowMD is provided "as is" without warranties of any kind, express or implied. We are not liable for any clinical outcomes, patient harm, or professional consequences resulting from use of the platform.</p>

        <h2 className="text-lg font-semibold text-foreground">Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms. Material changes will be communicated via email.</p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default TermsConditions;
