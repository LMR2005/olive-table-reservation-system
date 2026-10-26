
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const statusSchema = z.object({
  reservationId: z.uuid(),
  paymentToken: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function POST(request: Request) {
  try {
    // 1. Validate the request
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, message: "Invalid request." },
        { status: 400 }
      );
    }

    const { reservationId, paymentToken } = parsed.data;

    // 2. Retrieve the reservation
    const { data: reservation, error: reservationError } =
      await supabaseAdmin
        .from("reservations")
        .select("id, status, payment_token_hash")
        .eq("id", reservationId)
        .maybeSingle();

    if (reservationError) {
      return Response.json(
        { success: false, message: "Unable to check payment." },
        { status: 500 }
      );
    }

    if (!reservation) {
      return Response.json(
        { success: false, message: "Reservation not found." },
        { status: 404 }
      );
    }

    // 3. Verify the customer's payment-access token
    const storedHash = reservation.payment_token_hash;

    if (
      typeof storedHash !== "string" ||
      !/^[a-f0-9]{64}$/i.test(storedHash)
    ) {
      return Response.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const incomingHash = createHash("sha256")
      .update(paymentToken)
      .digest();

    const expectedHash = Buffer.from(storedHash, "hex");

    if (!timingSafeEqual(incomingHash, expectedHash)) {
      return Response.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    // 4. Check whether PayHere payment was verified
    const { data: verifiedPayment, error: paymentError } =
      await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("reservation_id", reservation.id)
        .eq("provider", "payhere")
        .eq("status", "verified")
        .limit(1)
        .maybeSingle();

    if (paymentError) {
      return Response.json(
        { success: false, message: "Unable to check payment." },
        { status: 500 }
      );
    }

    // 5. Derive a safe status for the frontend
    const confirmed = reservation.status === "confirmed";
    const paymentVerified = Boolean(verifiedPayment);

    return Response.json(
      {
        success: true,
        reservationStatus: reservation.status,
        paymentVerified,
        confirmed,
        requiresReview: paymentVerified && !confirmed,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Payment status request failed:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to check payment status.",
      },
      { status: 500 }
    );
  }
}
