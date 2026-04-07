import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const initiatePayment = useCallback(async () => {
    try {
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
