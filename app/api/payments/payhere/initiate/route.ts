
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createHash, timingSafeEqual } from "node:crypto";


const initiatePaymentSchema = z.object({
    reservationId: z.uuid(),

    paymentToken: z.string().regex(/^[a-f0-9]{64}$/, {
        message: "Invalid payment token.",
    }),

    billing: z.object({
        address: z.string().trim().min(5).max(200),
        city: z.string().trim().min(2).max(100),
        country: z.literal("Sri Lanka"),
    }),
});

export async function POST(request: Request) {
    try {
        const rawBody = await request.json();

        const validation = initiatePaymentSchema.safeParse(rawBody);

        if (!validation.success) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid reservation ID.",
                },
                { status: 400 }
            );
        }

        const { reservationId, paymentToken, billing } = validation.data;

        //Retrieve the reservation
        const { data: reservation, error: reservationError } =
            await supabaseAdmin
                .from("reservations")
                .select(`
                    id,
                    customer_id,
                    booking_reference,
                    deposit_amount_lkr,
                    status,
                    payment_deadline,
                    payment_token_hash
                    `)
                .eq("id", reservationId)
                .single();

        //This stops payment initiation if the supplied ID doesn't correspond to a reservation.
        if (reservationError || !reservation) {
            return Response.json(
                {
                    success: false,
                    message: "Reservation not found.",
                },
                { status: 404 }
            );
        }

        //payment_token_hash
        const incomingHash = createHash("sha256")
            .update(paymentToken)
            .digest();

        const storedHash = reservation.payment_token_hash;

        if (
            !storedHash ||
            !/^[a-f0-9]{64}$/.test(storedHash)
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Payment authorization failed.",
                },
                { status: 403 }
            );
        }

        const storedHashBuffer = Buffer.from(storedHash, "hex");

        if (!timingSafeEqual(incomingHash, storedHashBuffer)) {
            return Response.json(
                {
                    success: false,
                    message: "Payment authorization failed.",
                },
                { status: 403 }
            );
        }


        const { data: existingPayment, error: lookupError } =
            await supabaseAdmin
                .from("payments")
                .select("id, provider_order_id, amount_lkr, currency, status")
                .eq("reservation_id", reservation.id)
                .eq("provider", "payhere")
                .eq("status", "pending")
                .maybeSingle();

        if (lookupError) {
            console.error("Payment lookup failed:", lookupError);

            return Response.json(
                {
                    success: false,
                    message: "Unable to check existing payment attempts.",
                },
                { status: 500 }
            );
        }

        if (existingPayment) {
            if (
                existingPayment.amount_lkr !== reservation.deposit_amount_lkr ||
                existingPayment.currency !== "LKR"
            ) {
                return Response.json(
                    {
                        success: false,
                        message: "Existing payment amount does not match the reservation.",
                    },
                    { status: 409 }
                );
            }
        }


        let payment = existingPayment;

        if (!payment) {
            const orderId = `OLT-${randomUUID()}`;

            const paymentData = {
                reservation_id: reservation.id,
                provider: "payhere",
                provider_order_id: orderId,
                amount_lkr: reservation.deposit_amount_lkr,
                currency: "LKR",
                status: "pending",
            };

            const { data: newPayment, error: paymentError } =
                await supabaseAdmin
                    .from("payments")
                    .insert(paymentData)
                    .select("id, provider_order_id, amount_lkr, currency, status")
                    .single();

            if (paymentError) {
                // Another concurrent request may have created the pending attempt.
                if (paymentError.code === "23505") {
                    const { data: concurrentPayment, error: retryError } =
                        await supabaseAdmin
                            .from("payments")
                            .select("id, provider_order_id, amount_lkr, currency, status")
                            .eq("reservation_id", reservation.id)
                            .eq("provider", "payhere")
                            .eq("status", "pending")
                            .maybeSingle();

                    if (retryError || !concurrentPayment) {
                        return Response.json(
                            { success: false, message: "Unable to retrieve payment attempt." },
                            { status: 500 }
                        );
                    }

                    payment = concurrentPayment;
                } else {
                    console.error("Payment creation failed:", paymentError);
                    return Response.json(
                        { success: false, message: "Unable to create payment attempt." },
                        { status: 500 }
                    );
                }
            } else {
                payment = newPayment;
            }
        }

        if (!payment) {
            return Response.json(
                { success: false, message: "Payment attempt unavailable." },
                { status: 500 }
            );
        }

        if (
            payment.amount_lkr !== reservation.deposit_amount_lkr ||
            payment.currency !== "LKR"
        ) {
            return Response.json(
                { success: false, message: "Payment details do not match." },
                { status: 409 }
            );
        }
        //Check whether payment is allowed
        if (reservation.status !== "pending_payment") {
            return Response.json(
                {
                    success: false,
                    message: "This reservation is not awaiting payment.",
                },
                { status: 409 }
            );
        }

        if (
            !reservation.payment_deadline ||
            new Date(reservation.payment_deadline).getTime() <= Date.now()
        ) {
            return Response.json(
                {
                    success: false,
                    message: "The payment deadline has expired. Please make a new reservation.",
                },
                { status: 409 }
            );
        }

        if (
            !Number.isSafeInteger(reservation.deposit_amount_lkr) ||
            reservation.deposit_amount_lkr <= 0
        ) {
            return Response.json(
                {
                    success: false,
                    message: "The reservation payment amount is invalid.",
                },
                { status: 409 }
            );
        }

        const { data: customer, error: customerError } =
            await supabaseAdmin
                .from("customers")
                .select("full_name, email, phone")
                .eq("id", reservation.customer_id)
                .single();

        if (customerError || !customer) {
            return Response.json(
                {
                    success: false,
                    message: "Unable to retrieve customer details.",
                },
                { status: 500 }
            );
        }


        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        if (!merchantId || !merchantSecret) {
            console.error("PayHere credentials are missing.");

            return Response.json(
                {
                    success: false,
                    message: "Payment service is not configured.",
                },
                { status: 503 }
            );
        }

        const amount = Number(payment.amount_lkr).toFixed(2);
        const currency = "LKR";

        const hashedSecret = createHash("md5")
            .update(merchantSecret)
            .digest("hex")
            .toUpperCase();

        const checkoutHash = createHash("md5")
            .update(
                merchantId +
                payment.provider_order_id +
                amount +
                currency +
                hashedSecret
            )
            .digest("hex")
            .toUpperCase();


        const baseUrl = process.env.APP_BASE_URL;

        if (!baseUrl) {
            return Response.json(
                {
                    success: false,
                    message: "Payment URLs are not configured.",
                },
                { status: 503 }
            );
        }

        const siteUrl = new URL(baseUrl);

        if (
            siteUrl.protocol !== "https:" ||
            siteUrl.username ||
            siteUrl.password ||
            siteUrl.search ||
            siteUrl.hash
        ) {
            throw new Error("Invalid payment site URL configuration.");
        }

        const returnUrl = new URL(
            "/reservation/payment-result",
            siteUrl
        ).toString();

        const cancelUrl = new URL(
            "/reservation/payment-cancelled",
            siteUrl
        ).toString();

        const notifyUrl = new URL(
            "/api/payments/payhere/notify",
            siteUrl
        ).toString();

        const nameParts = customer.full_name.trim().split(/\s+/);

        const firstName = nameParts[0] ?? "";
        const lastName = nameParts.slice(1).join(" ") || firstName;

        const checkoutUrl =
            process.env.PAYHERE_MODE === "sandbox"
                ? "https://sandbox.payhere.lk/pay/checkout"
                : "https://www.payhere.lk/pay/checkout";

        const checkoutFields = {
            merchant_id: merchantId,
            return_url: returnUrl,
            cancel_url: cancelUrl,
            notify_url: notifyUrl,

            order_id: payment.provider_order_id,
            items: `Restaurant reservation ${reservation.booking_reference}`,

            currency: currency,
            amount: amount,
            hash: checkoutHash,

            first_name: firstName,
            last_name: lastName,
            email: customer.email,
            phone: customer.phone,

            address: billing.address,
            city: billing.city,
            country: billing.country,
        };

        return Response.json({
            success: true,
            checkoutUrl,
            fields: checkoutFields,
        });


        // Next: Retrieve the reservation from Supabase.
    } catch (error) {
        console.error("Payment initiation error:", error);

        return Response.json(
            {
                success: false,
                message: "Unable to initiate payment.",
            },
            { status: 500 }
        );
    }
}
