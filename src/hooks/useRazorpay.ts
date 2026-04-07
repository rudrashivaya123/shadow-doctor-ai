import { useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = (onSuccess?: () => void) => {
  const { toast } = useToast();

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
      if (error || !orderData?.order_id) {
        toast({
          title: "Payment Error",
          description: "Could not initiate payment. Try again.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShadowMD",
        description: "Premium Plan – ₹1,499/month",
        order_id: orderData.order_id,
        handler: async (response: any) => {
          const { data: verifyData, error: verifyError } =
            await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

          if (verifyError || !verifyData?.success) {
            toast({
              title: "Verification Failed",
              description: "Payment could not be verified. Contact support.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "🎉 Upgrade Successful!",
            description: "You now have full premium access for 30 days.",
          });
          onSuccess?.();
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast({
          title: "Payment Failed",
          description: "Your payment was not completed. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, onSuccess]);

  return { initiatePayment };
};
