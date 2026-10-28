
import { createHash, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();


    console.info("[PayHere Notify] Request received", {
      timestamp: new Date().toISOString(),
      contentType: request.headers.get("content-type"),
      fieldNames: [...formData.keys()],
    });

    const getField = (name: string): string | null => {
      const value = formData.get(name);
      return typeof value === "string" ? value : null;
    };

    const merchantId = getField("merchant_id");
    const orderId = getField("order_id");
    const paymentId = getField("payment_id");
    const amount = getField("payhere_amount");
    const currency = getField("payhere_currency");
    const statusCode = getField("status_code");
    const receivedSignature = getField("md5sig");
    const paymentMethod = getField("method");

    if (
      !merchantId ||
      !orderId ||
      !paymentId ||
      !amount ||
      !currency ||
      !statusCode ||
      !receivedSignature
    ) {
      return new Response("Invalid notification", { status: 400 });
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const expectedMerchantId = process.env.PAYHERE_MERCHANT_ID;

    if (!merchantSecret || !expectedMerchantId) {
      return new Response("Payment service unavailable", {
        status: 503,
      });
    }

    if (merchantId !== expectedMerchantId) {
      return new Response("Invalid merchant", { status: 403 });
    }

    const hashedSecret = createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const expectedSignature = createHash("md5")
      .update(
        merchantId +
        orderId +
        amount +
        currency +
        statusCode +
        hashedSecret
      )
      .digest("hex")
      .toUpperCase();

    if (!/^[a-fA-F0-9]{32}$/.test(receivedSignature)) {
      return new Response("Invalid signature", { status: 403 });
    }

    if (
      !timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(receivedSignature, "hex")
      )
    ) {
      return new Response("Signature verification failed", {
        status: 403,
      });
    }

    console.info("[PayHere Notify] Signature verified");

    const { data: payment, error: lookupError } =
      await supabaseAdmin
        .from("payments")
        .select("id, amount_lkr, currency")
        .eq("provider", "payhere")
        .eq("provider_order_id", orderId)
        .maybeSingle();

    if (lookupError || !payment) {
      return new Response("Payment not found", { status: 404 });
    }

    if (
      !Number.isSafeInteger(payment.amount_lkr) ||
      amount !== payment.amount_lkr.toFixed(2) ||
      currency !== "LKR" ||
      payment.currency !== "LKR"
    ) {
      return new Response("Payment mismatch", { status: 409 });
    }

    if (!["2", "0", "-1", "-2", "-3"].includes(statusCode)) {
      return new Response("Invalid payment status", { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "process_payhere_notification",
      {
        p_order_id: orderId,
        p_payment_id: paymentId,
        p_amount_lkr: payment.amount_lkr,
        p_currency: currency,
        p_status_code: statusCode,
        p_payment_method: paymentMethod?.slice(0, 50) ?? null,
      }
    );
    console.info("[PayHere Notify] Database result:", {
      result: data?.result,
    });

    if (error) {
      console.error("PayHere processing failed:", error);
      return new Response("Payment processing failed", {
        status: 500,
      });
    }

    console.info("PayHere notification processed:", {
      orderId,
      result: data?.result,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayHere callback error:", error);

    return new Response("Internal server error", {
      status: 500,
    });
  }
}
