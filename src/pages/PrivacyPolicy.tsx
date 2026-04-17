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
      <p className="text-sm text-muted-foreground">Last updated: April 17, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>
          ShadowMD ("we", "our", "us") is operated in India and is committed to protecting the privacy of every doctor, medical
          student, and healthcare professional who uses our AI-assisted clinical decision support platform. This Privacy Policy
          explains what information we collect, why we collect it, how we use and protect it, and the rights you have over your
          data. We follow the principles of India's <strong className="text-foreground">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>,
          the <strong className="text-foreground">Information Technology Act, 2000</strong>, and globally accepted healthcare
          privacy frameworks similar to <strong className="text-foreground">HIPAA</strong>.
        </p>

        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p>We only collect data that is necessary to provide and improve the ShadowMD service:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong className="text-foreground">Account data:</strong> name, email address, mobile number, professional role.</li>
          <li><strong className="text-foreground">Device data:</strong> device fingerprint, browser type, IP address, operating system (used for trial enforcement and security).</li>
          <li><strong className="text-foreground">Clinical inputs:</strong> symptoms, history, notes, and images that you voluntarily enter into the consultation tools.</li>
          <li><strong className="text-foreground">Usage data:</strong> features used, pages visited, response times, and error logs (used to improve performance).</li>
          <li><strong className="text-foreground">Payment data:</strong> processed directly by Razorpay; we never store card numbers, CVVs, or UPI PINs on our servers.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>To deliver AI-generated clinical suggestions, differentials, and reports.</li>
          <li>To authenticate you, manage your trial period, and process your subscription.</li>
          <li>To improve diagnostic accuracy, fix bugs, and prevent abuse.</li>
          <li>To send transactional communication (account, billing, security).</li>
          <li>To comply with applicable Indian laws and respond to lawful requests.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Patient Data &amp; HIPAA-like Safeguards</h2>
        <p className="font-medium text-foreground">
          ShadowMD is a tool for healthcare professionals. You are the data fiduciary for any patient information you enter.
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>You must obtain valid patient consent before entering identifiable medical data.</li>
          <li>Patient names, ages, and clinical notes you save are <strong className="text-foreground">restricted to your account only</strong> through Row-Level Security (RLS).</li>
          <li>We recommend entering de-identified information wherever possible.</li>
          <li>We do not use patient-level clinical data to train AI models.</li>
          <li>All data is encrypted in transit (TLS 1.2+) and at rest (AES-256).</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">4. Legal Basis for Processing (DPDP Act)</h2>
        <p>
          We process your personal data based on (a) your explicit consent at signup, (b) the necessity of performing the service
          contract you signed up for, and (c) compliance with legal obligations under Indian law.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Data Sharing</h2>
        <p>We do not sell, rent, or trade your personal information. We share data only with:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong className="text-foreground">Cloud infrastructure providers</strong> (Supabase / AWS) under strict data-processing agreements.</li>
          <li><strong className="text-foreground">AI model providers</strong> (Google Gemini, OpenAI via Lovable AI Gateway) for processing the prompts you submit. Inputs are not used to train their public models when accessed through enterprise APIs.</li>
          <li><strong className="text-foreground">Razorpay</strong> for payment processing.</li>
          <li><strong className="text-foreground">Government authorities</strong> only when legally compelled.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">6. Data Retention</h2>
        <p>
          We retain account and consultation data for as long as your account is active. On account deletion, all personal data
          and consultation records are permanently deleted within 30 days, except where retention is required by law (e.g.,
          financial records under the Companies Act and Income Tax Act).
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
        <p>Under the DPDP Act, 2023 you have the right to:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or update of inaccurate data.</li>
          <li>Request erasure of your data ("right to be forgotten").</li>
          <li>Withdraw consent at any time.</li>
          <li>Nominate another individual to exercise your rights in case of incapacity.</li>
          <li>File a grievance with our Grievance Officer (see Section 10).</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">8. Security Measures</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>JWT-based authentication and session expiry.</li>
          <li>Row-Level Security (RLS) on all clinical tables.</li>
          <li>Encryption in transit (TLS) and at rest (AES-256).</li>
          <li>Regular security scans and rate limiting on all APIs.</li>
          <li>Server-side trial validation to prevent tampering.</li>
        </ul>
        <p>However, no method of transmission over the Internet is 100% secure. You are responsible for keeping your login credentials confidential.</p>

        <h2 className="text-lg font-semibold text-foreground">9. Cookies &amp; Tracking</h2>
        <p>
          We use only essential cookies for authentication and session management. We may use privacy-respecting analytics
          (such as Plausible or self-hosted analytics) to count page views; we do not use behavioural advertising trackers.
        </p>

        <h2 className="text-lg font-semibold text-foreground">10. Grievance Officer (per IT Rules, 2011)</h2>
        <p>
          For any privacy concern or DPDP-related request, please contact our Grievance Officer:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong className="text-foreground">Email:</strong> <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a></li>
          <li><strong className="text-foreground">Response time:</strong> within 30 days as required by law.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Material changes will be notified via email or an in-app banner at
          least 7 days before they take effect. Continued use after the effective date constitutes acceptance.
        </p>

        <h2 className="text-lg font-semibold text-foreground">12. Contact</h2>
        <p>
          Questions? Email <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a>.
        </p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default PrivacyPolicy;
