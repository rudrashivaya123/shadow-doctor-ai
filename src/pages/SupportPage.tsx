import { Link } from "react-router-dom";
import { Activity, ArrowLeft, HelpCircle, CreditCard, Clock, RotateCcw, Shield, Mail } from "lucide-react";
import AppFooter from "@/components/AppFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    icon: CreditCard,
    question: "How does the subscription work?",
    answer:
      "ShadowMD Pro costs ₹1,499/month and gives you unlimited access to all clinical tools including AI symptom analysis, radiology AI support, structured reports, and consultation history. You can subscribe directly from the homepage — no login required to start.",
  },
  {
    icon: Clock,
    question: "What is included in the 3-day free trial?",
    answer:
      "New users get 3 days of full, unrestricted access to every feature — AI consultations, image analysis, clinical reports, and patient management. No credit card is required to start. After the trial ends, you'll need to subscribe to continue using the platform.",
  },
  {
    icon: RotateCcw,
    question: "What is the refund policy?",
    answer:
      "All subscription payments are non-refundable once the service has been accessed or used. Refunds are only issued for duplicate transactions or technical errors that prevent service access. Requests must be made within 3–5 days of the transaction by contacting shadowmd9434@gmail.com.",
  },
  {
    icon: Shield,
    question: "Is my patient data secure?",
    answer:
      "Yes. All data is encrypted in transit and at rest. We follow HIPAA-aware design principles. ShadowMD does not store sensitive medical data without your consent, and we never sell personal information to third parties.",
  },
  {
    icon: HelpCircle,
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription at any time by contacting us at shadowmd9434@gmail.com. Your access will remain active until the end of your current billing period. No additional charges will be made after cancellation.",
  },
  {
    icon: HelpCircle,
    question: "Is ShadowMD a replacement for clinical judgment?",
    answer:
      "No. ShadowMD is an AI-assisted clinical decision support tool designed to augment — not replace — professional medical judgment. All AI-generated suggestions should be verified by a licensed healthcare professional before any clinical decisions are made.",
  },
];

const SupportPage = () => (
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

    <main className="flex-1 max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about ShadowMD.
        </p>
      </div>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-border/50 bg-card/60 px-5 overflow-hidden"
            >
              <AccordionTrigger className="text-left text-sm font-medium py-4 hover:no-underline">
                <span className="flex items-center gap-3">
                  <faq.icon className="h-4 w-4 text-primary shrink-0" />
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4 pl-7">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Still need help?
        </h2>
        <p className="text-sm text-muted-foreground">
          Reach out to our support team and we'll get back to you within 24 hours.
        </p>
        <a
           href="mailto:shadowmd9434@gmail.com"
           className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
         >
           shadowmd9434@gmail.com
        </a>
      </section>
    </main>

    <AppFooter />
  </div>
);

export default SupportPage;
