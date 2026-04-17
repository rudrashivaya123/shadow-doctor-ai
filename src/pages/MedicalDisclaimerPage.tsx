import { Link } from "react-router-dom";
import { Activity, ArrowLeft, AlertTriangle, Stethoscope, ShieldAlert } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const MedicalDisclaimerPage = () => (
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
        <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Medical Disclaimer</h1>
      </div>
      <p className="text-sm text-muted-foreground">Last updated: April 17, 2026</p>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-foreground font-medium">
          ShadowMD is a clinical decision support tool for licensed healthcare professionals. It does NOT provide medical advice,
          diagnose disease, or replace a qualified doctor's judgement. In any emergency, dial <strong>112</strong> (India)
          immediately.
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">1. Not Medical Advice</h2>
        <p>
          The information, suggestions, differentials, drug references, and image analyses provided by ShadowMD are for
          informational and educational purposes only. They are <strong className="text-foreground">not</strong> a substitute
          for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified physician with any
          questions regarding a medical condition.
        </p>
        <p>
          ShadowMD is an educational and reference support tool. It does not provide clinical decision-making, diagnosis, or
          treatment recommendations.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Designed for Clinicians</h2>
        <p>
          ShadowMD's outputs are intended to be interpreted by trained healthcare professionals. Patients, caregivers, or
          general consumers should not act on any suggestion shown in the platform without consulting a registered medical
          practitioner.
        </p>
        <p>
          ShadowMD does not generate prescriptions or final treatment decisions. All outputs must be independently verified by
          a licensed medical practitioner before any clinical action.
        </p>

        <h2 className="text-lg font-semibold text-foreground">3. No Doctor–Patient Relationship</h2>
        <p>
          Use of ShadowMD does not create a doctor–patient relationship between you and ShadowMD, its founders, or its
          employees. We do not practise medicine. We provide a software tool.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. Limitation of Liability</h2>
        <p>
          ShadowMD and its founders, operators, and affiliates shall not be liable for any clinical decisions, outcomes,
          adverse events, or damages arising directly or indirectly from the use of this platform.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Emergency Situations</h2>
        <p>
          ShadowMD is <strong className="text-foreground">not</strong> designed for emergency triage. If you or your patient is
          experiencing a medical emergency — including but not limited to chest pain, severe shortness of breath, stroke
          symptoms, severe bleeding, suicidal ideation, or anaphylaxis — call <strong>112</strong> or go to the nearest
          emergency department immediately.
        </p>

        <h2 className="text-lg font-semibold text-foreground">6. Drug &amp; Dosage Information</h2>
        <p>
          Any drug names, dosages, or treatment plans suggested by ShadowMD are general references based on common Indian
          guidelines. They must be cross-verified against current package inserts, your hospital's formulary, the patient's
          renal/hepatic status, allergies, and drug interactions before any prescription is written.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Diagnostic Imaging</h2>
        <p>
          Image analysis features (radiology, dermatology, etc.) are screening aids only. They are not licensed as a medical
          device and must not be used as the sole basis for diagnosis. A qualified radiologist or specialist must confirm all
          findings.
        </p>

        <h2 className="text-lg font-semibold text-foreground">8. No Guarantees</h2>
        <p>
          We make no representation that the information provided by ShadowMD is complete, accurate, current, or applicable to
          any specific patient. Medicine evolves rapidly; AI outputs may lag behind the latest evidence.
        </p>

        <h2 className="text-lg font-semibold text-foreground">9. Professional Responsibility</h2>
        <p>
          The clinician using ShadowMD remains fully responsible for:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>The final diagnosis and treatment plan.</li>
          <li>Patient consent, communication, and safety.</li>
          <li>Compliance with the Indian Medical Council Act, NMC regulations, and applicable clinical guidelines.</li>
          <li>Maintaining accurate medical records.</li>
        </ul>
        <p>
          Access to ShadowMD is intended for licensed healthcare professionals only. Users may be required to verify their
          professional credentials to use certain features.
        </p>

        <h2 className="text-lg font-semibold text-foreground">10. Privacy of AI Inputs</h2>
        <p>
          Information entered into ShadowMD — including symptoms, history, and uploaded images — may be processed by
          third-party AI providers to generate clinical suggestions. Clinicians should avoid entering directly identifiable
          patient information (full name, exact address, government IDs) wherever possible.
        </p>
        <p>
          Users are responsible for ensuring compliance with applicable Indian data protection laws, including the Information
          Technology Act and SPDI Rules, when entering patient data.
        </p>

        <h2 className="text-lg font-semibold text-foreground">11. Jurisdiction</h2>
        <p>
          This platform is governed by and construed in accordance with the laws of India. Any disputes arising from its use
          shall be subject to the jurisdiction of Indian courts.
        </p>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex gap-3 items-start mt-6">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            By using ShadowMD, you confirm that you understand and accept this Medical Disclaimer in full. If you do not agree,
            you must stop using the platform immediately.
          </p>
        </div>

        <p className="text-xs italic">
          For questions, write to <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a>.
        </p>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default MedicalDisclaimerPage;
