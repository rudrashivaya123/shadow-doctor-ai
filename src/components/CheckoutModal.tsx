import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutModal = ({ open, onOpenChange }: CheckoutModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleProceed = async () => {
    const { checkoutSchema, firstZodError } = await import("@/lib/validation");
    const result = checkoutSchema.safeParse({ name, email, phone });
    if (!result.success) {
      toast({ title: "Invalid input", description: firstZodError(result), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Create order without authentication
      const orderRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ name, email, phone }),
        }
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Open Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShadowMD",
        description: "Pro Plan – ₹1,499/month",
        order_id: orderData.order_id,
        prefill: { name, email, contact: phone },
        handler: async (response: any) => {
          setStep("processing");
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  name,
                  email,
                  phone,
                }),
              }
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Verification failed");
            }

            // Auto-login if session returned
            if (verifyData.session) {
              await supabase.auth.setSession({
                access_token: verifyData.session.access_token,
                refresh_token: verifyData.session.refresh_token,
              });
            }

            setStep("success");
            setTimeout(() => {
              onOpenChange(false);
              navigate("/dashboard");
            }, 2000);
          } catch {
            toast({
              title: "Verification Issue",
              description: "Payment received but account setup had an issue. Please contact support.",
              variant: "destructive",
            });
            setStep("form");
          }
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (step === "processing") {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-border/60">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-semibold text-foreground">Setting up your account...</p>
            <p className="text-sm text-muted-foreground">Please wait while we activate your Pro plan.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-border/60">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">🎉 Payment Successful!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your account has been created and Pro plan is now active.<br />
              Redirecting to dashboard...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/60">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Complete Your Purchase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Plan summary */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">ShadowMD Pro</span>
              <span className="text-lg font-bold text-foreground">₹1,499<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
            </div>
            <p className="text-xs text-muted-foreground">Unlimited consultations • Radiology AI • Reports • Priority support</p>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="checkout-name" className="text-sm">Full Name</Label>
              <Input
                id="checkout-name"
                placeholder="Dr. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-email" className="text-sm">Email Address</Label>
              <Input
                id="checkout-email"
                type="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-phone" className="text-sm">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="checkout-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground h-11 text-base font-semibold"
            onClick={handleProceed}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Payment</span>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Encrypted</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
