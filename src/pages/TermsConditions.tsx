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
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: April 17, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>
          These Terms of Service ("Terms") form a legally binding agreement between you ("User", "you") and
          <strong className="text-foreground"> ShadowMD</strong> ("we", "our", "us"). By creating an account or using any part of
          the ShadowMD platform (web app, APIs, AI tools), you confirm that you have read, understood, and agreed to these Terms,
          our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, our
          <Link to="/medical-disclaimer" className="text-primary hover:underline"> Medical Disclaimer</Link>, our
          <Link to="/ai-disclaimer" className="text-primary hover:underline"> AI Limitation Disclaimer</Link>, and our
          <Link to="/data-consent" className="text-primary hover:underline"> Data Usage Consent</Link>.
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Eligibility &amp; Intended Users</h2>
        <p>ShadowMD is an AI-assisted clinical decision support tool designed exclusively for:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Licensed medical practitioners (MBBS, MD, BDS, BHMS, BAMS, etc.) registered with a recognised Indian or international medical council.</li>
          <li>Postgraduate residents and final-year medical students under faculty supervision.</li>
          <li>Healthcare organisations licensing the platform for their clinical staff.</li>
        </ul>
        <p>
          ShadowMD is <strong className="text-foreground">not</strong> intended for use by patients or general consumers as a
          self-diagnosis tool. By signing up, you confirm you are at least 18 years old and meet the eligibility criteria.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Nature of the Service</h2>
        <p>
          ShadowMD provides AI-generated clinical suggestions, differential diagnoses, investigation recommendations, drug
          information, image analyses, and structured SOAP summaries. <strong className="text-foreground">All outputs are
          decision-support suggestions only and are not medical advice, diagnoses, prescriptions, or treatment plans.</strong>
          Final clinical judgment, prescription, and patient communication remain solely your responsibility.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. Account &amp; Security</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>You must provide accurate information at signup and keep it updated.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>You must not share credentials or use another person's account.</li>
          <li>Notify us immediately at <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a> of any unauthorised access.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">4. Free Trial</h2>
        <p>
          New users receive a 3-day (72-hour) free trial with full access. The trial is enforced server-side using device
          fingerprinting and is non-transferable. Attempts to bypass trial limits (multiple accounts, fake numbers, fingerprint
          spoofing) will result in immediate termination.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Subscription &amp; Billing</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>ShadowMD Pro is offered at <strong className="text-foreground">₹1,499 per month</strong> (inclusive of applicable taxes).</li>
          <li>Payments are processed securely via Razorpay; we never store your card or UPI details.</li>
          <li>Subscriptions auto-renew unless cancelled before the next billing cycle.</li>
          <li>Pricing may change with at least 14 days' prior notice.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">6. Refunds &amp; Cancellation</h2>
        <p>
          See our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>. In short: subscriptions are
          non-refundable once the service has been accessed; refunds are issued only for duplicate transactions or technical
          failures. You may cancel any time by emailing us; access continues until the end of the paid period.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Acceptable Use</h2>
        <p>You agree NOT to:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Use ShadowMD for any unlawful, harmful, or fraudulent purpose.</li>
          <li>Reverse engineer, scrape, or copy any part of the platform.</li>
          <li>Resell or sublicense access without a written agreement.</li>
          <li>Upload patient data without valid consent.</li>
          <li>Misrepresent AI outputs as definitive diagnoses to patients.</li>
          <li>Attempt to bypass authentication, rate limits, or trial enforcement.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">8. Intellectual Property</h2>
        <p>
          All software, design, prompts, AI orchestration logic, and brand elements of ShadowMD are owned by us and protected
          under the Indian Copyright Act, 1957 and Trade Marks Act, 1999. You retain ownership of the clinical content you
          enter; you grant us a limited, revocable licence to process it solely to provide the service.
        </p>

        <h2 className="text-lg font-semibold text-foreground">9. Professional Responsibility</h2>
        <p>
          You acknowledge that you are bound by the regulations of your medical council (NMC, MCI, state councils, or
          equivalent). ShadowMD does not exempt you from any duty of care, documentation, or standard of practice required by
          law or professional ethics.
        </p>

        <h2 className="text-lg font-semibold text-foreground">10. Disclaimers</h2>
        <p>
          The service is provided <strong className="text-foreground">"as is" and "as available"</strong> without warranties of
          any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy, or non-infringement.
          See the <Link to="/medical-disclaimer" className="text-primary hover:underline">Medical Disclaimer</Link> and
          <Link to="/ai-disclaimer" className="text-primary hover:underline"> AI Limitation Disclaimer</Link> for details.
        </p>

        <h2 className="text-lg font-semibold text-foreground">11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by Indian law, ShadowMD, its founders, employees, and partners shall not be liable for
          any indirect, incidental, consequential, or punitive damages, including but not limited to clinical outcomes, patient
          harm, loss of revenue, loss of reputation, or loss of data, arising from your use of the platform. Our total aggregate
          liability shall not exceed the subscription fees paid by you in the 3 months preceding the claim.
        </p>

        <h2 className="text-lg font-semibold text-foreground">12. Indemnity</h2>
        <p>
          You agree to indemnify and hold harmless ShadowMD against any claims, losses, or damages arising from (a) your misuse
          of the platform, (b) your breach of these Terms, or (c) any clinical decision you take based on AI suggestions.
        </p>

        <h2 className="text-lg font-semibold text-foreground">13. Suspension &amp; Termination</h2>
        <p>
          We may suspend or terminate your account immediately if you violate these Terms, abuse the platform, or engage in
          fraudulent activity. You may delete your account at any time by emailing us.
        </p>

        <h2 className="text-lg font-semibold text-foreground">14. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of the
          courts at <strong className="text-foreground">Bengaluru, Karnataka</strong>.
        </p>

        <h2 className="text-lg font-semibold text-foreground">15. Changes to Terms</h2>
        <p>
          We may update these Terms periodically. Material changes will be communicated via email or an in-app notice at least
          7 days in advance. Continued use after the effective date constitutes acceptance.
        </p>

        <h2 className="text-lg font-semibold text-foreground">16. Contact</h2>
        <p>
          Email <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a> for
          any legal or contractual queries.
        </p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default TermsConditions;
