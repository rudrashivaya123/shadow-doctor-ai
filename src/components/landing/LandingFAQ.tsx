import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is ShadowMD and how does it help doctors?",
    a: "ShadowMD is an AI-powered clinical decision support tool designed for doctors in India. It provides instant differential diagnosis from symptoms, AI-assisted radiology image analysis (X-ray, CT, MRI), and structured clinical reports — helping doctors make faster, more accurate decisions during OPD.",
  },
  {
    q: "Is ShadowMD a replacement for a doctor?",
    a: "No. ShadowMD is an AI-assisted tool that supports clinical decision-making. It is designed to be a second opinion for licensed medical professionals. Final diagnosis and treatment decisions must always be made by a qualified doctor.",
  },
  {
    q: "How accurate is the AI diagnosis?",
    a: "ShadowMD uses advanced AI models trained on medical literature and clinical patterns. Each diagnosis includes a confidence score (50–95%) and the AI performs a self-check to flag potentially missed dangerous conditions. However, AI suggestions must always be verified with clinical assessment.",
  },
  {
    q: "Is my patient data safe and private?",
    a: "Yes. ShadowMD uses encryption in transit (TLS) and at rest, row-level security policies, and JWT-based authentication. Patient data is accessible only to the authenticated account holder. We do not share clinical data with third parties.",
  },
  {
    q: "How does the 3-day free trial work?",
    a: "Sign up with your phone number and get full access to all features — AI consultation, radiology analysis, clinical reports — for 72 hours. No credit card required. After the trial, you can upgrade to the Pro plan at ₹1,499/month.",
  },
  {
    q: "Can I use ShadowMD on my mobile phone?",
    a: "Yes. ShadowMD is fully responsive and optimized for mobile use. You can run consultations, upload images, and view reports on any smartphone or tablet browser — perfect for busy OPD environments.",
  },
  {
    q: "What types of medical images can I upload?",
    a: "ShadowMD supports X-rays, CT scans, MRIs, dermoscopy images, clinical photographs, and oral images. You can upload up to 5 images per case in JPEG or PNG format (max 10MB each) for AI-assisted analysis.",
  },
  {
    q: "Is ShadowMD available in Hindi?",
    a: "Yes. ShadowMD supports both English and Hindi for clinical reports and AI analysis, making it accessible for doctors across India.",
  },
];

const LandingFAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28 px-4 border-t border-border/30" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything doctors ask before getting started with ShadowMD.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </section>
  );
};

export default LandingFAQ;
