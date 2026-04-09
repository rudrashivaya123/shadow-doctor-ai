import { Link } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const PrivacyPolicy = () => (
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
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 7, 2026</p>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>ShadowMD ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you use the ShadowMD platform.</p>

        <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email address, phone number, and clinical consultation data entered into the platform. We also collect usage data such as pages visited and features used.</p>

        <h2 className="text-lg font-semibold text-foreground">How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, process payments via Razorpay, communicate with you about your account, and ensure service quality. We do not sell your personal information to third parties.</p>

        <h2 className="text-lg font-semibold text-foreground">Medical Data Disclaimer</h2>
        <p className="font-medium text-foreground">ShadowMD does not store sensitive medical data without your explicit consent.</p>
        <p>All consultation data is encrypted and accessible only to the authenticated account holder. We do not share clinical data with third parties for marketing or advertising purposes.</p>

        <h2 className="text-lg font-semibold text-foreground">Data Security</h2>
        <p>We implement industry-standard security measures including encryption in transit (TLS) and at rest, row-level security policies, and JWT-based authentication. However, no method of transmission over the Internet is 100% secure.</p>

        <h2 className="text-lg font-semibold text-foreground">Third-Party Services</h2>
        <p>We use Razorpay for payment processing. Your payment information is handled directly by Razorpay and is subject to their privacy policy. We do not store credit card or payment instrument details on our servers.</p>

        <h2 className="text-lg font-semibold text-foreground">Data Retention</h2>
        <p>We retain your account data for as long as your account is active. You may request deletion of your data by contacting us at shadowmd9434@gmail.com.</p>

        <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a>.</p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default PrivacyPolicy;
