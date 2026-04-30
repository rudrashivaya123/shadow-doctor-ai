import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Lazy-load the Razorpay checkout script only when the user clicks "Upgrade".
// Loading it eagerly causes ~68ms of forced reflow on initial page load.
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.Razorpay) return resolve();
    const existing = document.getElementById("razorpay-script") as HTMLScriptElement | null;
    if (existing) {
      if (window.Razorpay) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay script failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.body.appendChild(script);
  });
};

export const useRazorpay = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initiatePayment = useCallback(async () => {
    try {
      try {
        await loadRazorpayScript();
      } catch {
        toast({
          title: "Payment Error",
          description: "Could not load payment system. Please check your connection and try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: orderData, error } = await supabase.functions.invoke(
        "create-razorpay-order"
      );

      if (error) {
        toast({
          title: "Payment Error",
          description: "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!orderData?.order_id) {
        toast({
          title: "Payment Error",
          description: orderData?.error || "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShadowMD",
        description: "Monthly Subscription — ₹1,499/mo",
        order_id: orderData.order_id,
        prefill: {
          email: user?.email || "",
        },
        handler: async (response: any) => {
          toast({
            title: "Verifying payment...",
            description: "Please wait while we confirm your payment.",
          });

          try {
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke("verify-razorpay-payment", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              });

            if (verifyError) {
              toast({
                title: "Payment Verification Failed",
                description: "Payment verification failed. Please contact support or retry.",
                variant: "destructive",
              });
              return;
            }

            if (!verifyData?.success) {
              toast({
                title: "Payment Verification Failed",
                description: verifyData?.error || "Payment verification failed. Please contact support or retry.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "🎉 Subscription Activated!",
              description: "Your subscription is now active for 30 days.",
            });
            onSuccess?.();
            navigate("/dashboard");
          } catch (verifyErr) {
            toast({
              title: "Payment Verification Failed",
              description: "Payment verification failed. Please contact support or retry.",
              variant: "destructive",
            });
          }
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: response?.error?.description || "Payment was not completed. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "Something went wrong initiating payment. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, onSuccess, navigate, user]);

  return { initiatePayment };
};
