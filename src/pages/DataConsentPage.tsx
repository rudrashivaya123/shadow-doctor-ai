import { Link } from "react-router-dom";
import { Activity, ArrowLeft, ShieldCheck, FileLock2, UserCheck } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const DataConsentPage = () => (
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
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <FileLock2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Data Usage Consent</h1>
      </div>
      <p className="text-sm text-muted-foreground">Last updated: April 17, 2026</p>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex gap-3 items-start">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground font-medium">
          By signing up for ShadowMD, you provide informed consent for the limited collection, processing, and storage of data
          described below, in line with India's Digital Personal Data Protection Act, 2023 (DPDP Act).
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">1. What You Consent To</h2>
        <p>By creating an account and using ShadowMD, you explicitly consent to:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Collection of your name, email, phone number, and professional role.</li>
          <li>Collection of device fingerprint and IP address for trial enforcement and security.</li>
          <li>Storage of clinical inputs you submit (symptoms, notes, images, patient records).</li>
          <li>Transmission of your prompts to AI processors (Google Gemini, OpenAI) via encrypted enterprise APIs for inference.</li>
          <li>Processing of payments via Razorpay.</li>
          <li>Receiving transactional emails about your account, billing, and security.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">2. What You Do NOT Consent To (by default)</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Marketing emails or SMS — opt-in only.</li>
          <li>Sharing of your data with third parties for advertising.</li>
          <li>Use of your patient-level clinical data to train AI models.</li>
          <li>Public disclosure of any identifiable information.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Patient Data You Enter</h2>
        <p>
          When you store information about a patient (name, age, history, images), you are acting as the
          <strong className="text-foreground"> data fiduciary</strong> under the DPDP Act and as the responsible clinician under
          NMC regulations. You confirm that:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>You have obtained valid, informed consent from the patient (or guardian) before entering identifiable data.</li>
          <li>You will use the platform only for legitimate clinical purposes.</li>
          <li>You will respect patient confidentiality at all times.</li>
          <li>You will inform the patient that AI is being used as a decision-support aid.</li>
        </ul>
        <p>
          Patient data is encrypted, stored under Row-Level Security, and accessible only to your account.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Suggested Patient Consent Script</h2>
        <div className="rounded-lg border border-border/60 bg-muted/40 p-4 not-prose">
          <p className="text-sm text-foreground italic">
            "I am using an AI-assisted clinical tool called ShadowMD to help me think through your case. Your information will
            be kept confidential and visible only to me. The AI provides suggestions, but the final medical decision is mine.
            Do you consent to me using this tool while reviewing your case?"
          </p>
        </div>

        <h2 className="text-lg font-semibold text-foreground">5. Withdrawal of Consent</h2>
        <p>
          You may withdraw your consent at any time by:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Deleting your account from the dashboard, or</li>
          <li>Emailing <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a> with the subject "Withdraw Consent".</li>
        </ul>
        <p>
          Withdrawal will result in deletion of your personal and clinical data within 30 days, except where retention is
          legally required (e.g., financial records).
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Children's Data</h2>
        <p>
          ShadowMD is not intended for users under 18. Patient records may include minors only when entered by a treating
          clinician with appropriate parental/guardian consent, in line with Section 9 of the DPDP Act.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Cross-Border Data Transfer</h2>
        <p>
          AI inference may be performed on servers located outside India. By using the platform, you consent to such transfer
          under the safeguards described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          We do not transfer data to countries restricted by the Government of India.
        </p>

        <h2 className="text-lg font-semibold text-foreground">8. Your Rights</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Right to access, correct, and erase your personal data.</li>
          <li>Right to grievance redressal within 30 days.</li>
          <li>Right to nominate a representative in case of incapacity.</li>
        </ul>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex gap-3 items-start mt-6">
          <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            By continuing to use ShadowMD, you confirm that you have read and freely consented to the data practices described
            above. Consent is revocable at any time.
          </p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default DataConsentPage;
