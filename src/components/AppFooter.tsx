import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const AppFooter = () => (
  <footer className="border-t border-border/40 bg-card/30 px-4 py-6">
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
        <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
        <Link to="/medical-disclaimer" className="text-muted-foreground hover:text-primary transition-colors">Medical Disclaimer</Link>
        <Link to="/ai-disclaimer" className="text-muted-foreground hover:text-primary transition-colors">AI Disclaimer</Link>
        <Link to="/data-consent" className="text-muted-foreground hover:text-primary transition-colors">Data Consent</Link>
        <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link>
        <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Shield className="h-3 w-3 shrink-0" />
        <span>ShadowMD is an AI-assisted tool and does not replace professional medical advice.</span>
      </div>
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Support: <a href="mailto:shadowmd9434@gmail.com" className="hover:text-primary transition-colors">shadowmd9434@gmail.com</a></p>
        <p>© 2026 ShadowMD. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default AppFooter;
