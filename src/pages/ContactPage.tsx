import { Link } from "react-router-dom";
import { Activity, ArrowLeft, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import AppFooter from "@/components/AppFooter";

const ContactPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Message sent", description: "We'll get back to you within 24 hours." });
  };

  return (
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
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <a href="mailto:shadowmd9434@gmail.com" className="text-primary hover:underline">shadowmd9434@gmail.com</a>
        </div>
        {submitted ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-2">
            <p className="font-semibold text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground">We've received your message and will respond within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Your name" required />
            <Input type="email" placeholder="Your email" required />
            <Textarea placeholder="Your message" rows={5} required />
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </form>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default ContactPage;
