import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Brain, AlertTriangle, Sparkles } from "lucide-react";
import AppFooter from "@/components/AppFooter";

const AIDisclaimerPage = () => (
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
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">AI Limitation Disclaimer</h1>
      </div>
      <p className="text-sm text-muted-foreground">Last updated: April 17, 2026</p>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-foreground font-medium">
          ShadowMD is powered by large language models (LLMs) and computer-vision models. AI can be wrong, biased, or outdated.
          Every suggestion must be verified by a qualified clinician before any clinical action.
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">1. What Powers ShadowMD</h2>
        <p>
          ShadowMD uses third-party foundation AI models (including Google Gemini and OpenAI GPT) accessed via secure
          enterprise gateways. These models are general-purpose and have been adapted for clinical decision support through
          structured prompts, multi-agent validation, and safety layers.
        </p>

        <h2 className="text-lg font-semibold text-foreground">2. Known Limitations of AI</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong className="text-foreground">Hallucination:</strong> AI may fabricate facts, drug names, dosages, or guideline references.</li>
          <li><strong className="text-foreground">Outdated knowledge:</strong> Models have a training cutoff and may not reflect the latest research, recalls, or guidelines.</li>
          <li><strong className="text-foreground">Bias:</strong> Training data may under-represent Indian populations, paediatric, geriatric, or rare diseases.</li>
          <li><strong className="text-foreground">Context limits:</strong> AI may misinterpret incomplete histories, ambiguous wording, or multilingual input.</li>
          <li><strong className="text-foreground">Image limitations:</strong> Image AI may miss subtle findings, mis-classify artefacts, or be affected by image quality, lighting, or angle.</li>
          <li><strong className="text-foreground">Probabilistic output:</strong> Confidence scores are estimates, not statistical guarantees.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">3. Our Safety Layers</h2>
        <p>
          To reduce risk, ShadowMD uses a multi-agent architecture:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li><strong className="text-foreground">Diagnostician agent</strong> — generates the initial structured reasoning.</li>
          <li><strong className="text-foreground">Validator agent</strong> — critically reviews and adjusts probabilities.</li>
          <li><strong className="text-foreground">Safety agent</strong> — screens for red flags and blocks unsafe advice.</li>
        </ul>
        <p>
          These layers reduce error but do not eliminate it.
        </p>

        <h2 className="text-lg font-semibold text-foreground">4. AI Is Not a Medical Device</h2>
        <p>
          ShadowMD is currently <strong className="text-foreground">not</strong> licensed or registered as a medical device under
          the Medical Device Rules, 2017 (CDSCO). It is a clinical decision support and educational tool. It must not be relied
          upon as a diagnostic device.
        </p>

        <h2 className="text-lg font-semibold text-foreground">5. Clinician Verification Is Mandatory</h2>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Cross-check every drug, dose, and dose-frequency against authoritative sources.</li>
          <li>Confirm all imaging findings with a qualified radiologist or specialist.</li>
          <li>Validate guideline citations against the original document.</li>
          <li>Treat every AI output as a "junior assistant's note", not a final report.</li>
        </ul>

        <h2 className="text-lg font-semibold text-foreground">6. Privacy of AI Inputs</h2>
        <p>
          Prompts you submit are transmitted to the AI provider over encrypted channels for inference only. We use enterprise
          API endpoints which do not retain inputs for model training. Avoid entering directly identifying patient information
          (full name, full address, exact MRN) where possible.
        </p>

        <h2 className="text-lg font-semibold text-foreground">7. Reporting AI Errors</h2>
        <p>
          If you observe a hallucination, unsafe suggestion, or biased output, please report it to
          <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline"> shadowmd9434@gmail.com</a>. Your
          feedback helps us improve safety.
        </p>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex gap-3 items-start mt-6">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            ShadowMD's mission is to <strong>augment</strong> doctors, not replace them. Use AI as a thinking partner — never
            as the final decision maker.
          </p>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
);

export default AIDisclaimerPage;
