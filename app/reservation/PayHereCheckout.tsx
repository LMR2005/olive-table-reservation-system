
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Script from "next/script";


type PayHereSDK = {
  startPayment: (
    payment: Record<string, string | boolean | undefined>
  ) => void;
  onCompleted: (orderId: string) => void;
  onDismissed: () => void;
  onError: (error: string) => void;
};

declare global {
  interface Window {
    payhere?: PayHereSDK;
  }
}

type PayHereCheckoutProps = {
  reservationId: string;
  paymentToken: string;
  depositAmount: number;

  bookingReference?: string;
  guests?: number;
  date?: string;
  time?: string;
  tableNames?: string[];
};

export default function PayHereCheckout({
  reservationId,
  paymentToken,
  depositAmount,
  bookingReference,
  guests,
  date,
  time,
  tableNames,
}: PayHereCheckoutProps) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const formattedAmount = depositAmount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  async function checkPaymentStatus() {
    setCheckingPayment(true);
    setError("");
    setPaymentMessage("Checking your payment status...");

    try {
      // Check several times because PayHere's server
      // notification may arrive after the popup closes.
      for (let attempt = 0; attempt < 10; attempt++) {
        const response = await fetch(
          "/api/payments/payhere/status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              reservationId,
              paymentToken,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to verify the payment status."
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Payment verification failed."
          );
        }

        // Reservation and payment must both be confirmed.
        if (result.confirmed && result.paymentVerified) {
          setPaymentConfirmed(true);
          setPaymentMessage(
            "Your payment has been verified and your reservation is confirmed!"
          );
          return;
        }

        // Money was received but the table could not
        // be confirmed, e.g. reservation hold expired.
        if (result.requiresReview) {
          setPaymentMessage(
            "Your payment was received, but your reservation requires staff review. Please contact the restaurant."
          );
          return;
        }

        if (
          result.reservationStatus === "expired" ||
          result.reservationStatus === "cancelled"
        ) {
          setPaymentMessage(
            "This reservation is no longer active. Do not make another payment until its status has been checked."
          );
          return;
        }

        // Wait two seconds before checking again.
        if (attempt < 9) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, 2000)
          );
        }
      }

      setPaymentMessage(
        "Payment confirmation is still pending. Please check again before attempting another payment."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify payment."
      );
    } finally {
      setCheckingPayment(false);
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (loading) return;

    if (address.trim().length < 5 || city.trim().length < 2) {
      setError("Please enter a valid billing address and city.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/payments/payhere/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId,
            paymentToken,
            billing: {
              address: address.trim(),
              city: city.trim(),
              country: "Sri Lanka",
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to initiate payment."
        );
      }

      const sandboxUrl =
        "https://sandbox.payhere.lk/pay/checkout";

      if (data.checkoutUrl !== sandboxUrl) {
        throw new Error("Unexpected checkout destination.");
      }

      if (
        !data.fields ||
        typeof data.fields !== "object" ||
        Array.isArray(data.fields)
      ) {
        throw new Error("Invalid checkout information.");
      }


      if (!window.payhere) {
        throw new Error(
          "PayHere has not loaded. Please refresh and try again."
        );
      }

      const payhere = window.payhere;

      // The popup completing does not prove payment succeeded.
      payhere.onCompleted = function (orderId: string) {
        console.info("PayHere checkout finished:", orderId);

        setLoading(false);
        void checkPaymentStatus();

        // We will check the verified reservation status here
        // after creating the payment-status endpoint.
        setError(
          "Payment processing finished. Your reservation " +
          "is awaiting confirmation."
        );
      };

      payhere.onDismissed = function () {
        setLoading(false);
        setError(
          "Payment window closed. Your payment has not been confirmed yet."
        );
      };

      payhere.onError = function (message: string) {
        setLoading(false);
        setError(`Payment error: ${message}`);
      };

      // Start PayHere's secure sandbox popup.
      payhere.startPayment({
        ...data.fields,
        sandbox: true,

        // Required for the popup-based integration.
        return_url: undefined,
        cancel_url: undefined,
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Script
        src="https://www.payhere.lk/lib/payhere-2.0.js"
        strategy="afterInteractive"
      />

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#A17B49]">
          02 / Secure payment
        </p>

        <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
          Complete your reservation
        </h2>

        <p className="mt-3 text-sm leading-7 text-[#65746B]">
          You're one step away from your table. Review your
          reservation and complete the deposit securely.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        {/* LEFT: Billing */}
        <section className="min-w-0 overflow-hidden rounded border border-[#E7E5DE] bg-white shadow-sm">
          <div className="border-b border-[#EEEEE9] px-5 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF3EE] text-[#295741]">
                <CreditCard size={21} strokeWidth={1.7} />
              </span>

              <div>
                <h2 className="font-serif text-xl text-[#173D32]">
                  Billing information
                </h2>
                <p className="mt-1 text-xs text-[#8B918B]">
                  Required for secure payment processing
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-7 sm:px-8">
            <div>
              <label
                htmlFor="billing-address"
                className="mb-2 block text-sm font-medium text-[#34453B]"
              >
                Billing address
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="billing-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street and area"
                autoComplete="street-address"
                maxLength={200}
                disabled={loading}
                className="h-12 w-full rounded-sm border border-[#DFE2DC] bg-[#FCFCFA] px-4 text-sm text-[#263B30] outline-none transition placeholder:text-[#A5AAA3] focus:border-[#40755B] focus:ring-2 focus:ring-[#40755B]/10 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="billing-city"
                  className="mb-2 block text-sm font-medium text-[#34453B]"
                >
                  City
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="billing-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Colombo"
                  autoComplete="address-level2"
                  maxLength={100}
                  disabled={loading}
                  className="h-12 w-full rounded-sm border border-[#DFE2DC] bg-[#FCFCFA] px-4 text-sm text-[#263B30] outline-none transition placeholder:text-[#A5AAA3] focus:border-[#40755B] focus:ring-2 focus:ring-[#40755B]/10 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#34453B]">
                  Country
                </label>

                <div className="flex h-12 items-center gap-2 rounded-lg border border-[#DFE2DC] bg-[#F6F7F3] px-4 text-sm text-[#55645B]">
                  <MapPin size={15} />
                  Sri Lanka
                </div>
              </div>
            </div>

            <div className="border-t border-[#EFEFEA] pt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#243C30]">
                  Payment methods
                </h3>

                <span className="text-xs text-[#929B92]">
                  Powered by PayHere
                </span>
              </div>

              <p className="mb-4 text-xs leading-5 text-[#879188]">
                Choose your payment method in the secure
                PayHere checkout window.
              </p>

              {/* Method indicators, not card-entry inputs */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 min-w-24 items-center justify-center rounded-lg border border-[#E3E6E1] bg-white px-4">
                  <span className="text-lg font-black italic tracking-tight text-[#173A8A]">
                    VISA
                  </span>
                </div>

                <div className="flex h-12 min-w-24 items-center justify-center gap-1 rounded-lg border border-[#E3E6E1] bg-white px-3">
                  <span className="h-5 w-5 rounded-full bg-[#E44D3A]" />
                  <span className="-ml-2 h-5 w-5 rounded-full bg-[#F6AB36]/90" />
                  <span className="ml-1 text-xs font-semibold text-[#333]">
                    Mastercard
                  </span>
                </div>

                <div className="flex h-12 items-center justify-center rounded-lg border border-[#E3E6E1] bg-white px-4">
                  <span className="text-sm font-bold tracking-tight text-[#28629C]">
                    AMEX
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E0EAE1] bg-[#F3F8F3] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-[#3E7656]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#315D42]">
                    Your payment is protected
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#688172]">
                    Card details are entered directly through
                    PayHere. The Olive Table does not collect
                    or store your card information.
                  </p>
                </div>
              </div>
            </div>


            {paymentMessage && (
              <div
                role="status"
                aria-live="polite"
                className={`border px-4 py-4 text-sm leading-6 ${paymentConfirmed
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-[#E3DFD2] bg-[#F8F6EE] text-[#536057]"
                  }`}
              >
                {paymentMessage}
              </div>
            )}

            {paymentMessage && !paymentConfirmed && !checkingPayment && (
              <button
                type="button"
                onClick={() => void checkPaymentStatus()}
                className="text-sm font-medium text-[#173D32] underline underline-offset-4"
              >
                Check payment status again
              </button>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || checkingPayment || paymentConfirmed}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-sm bg-[#173D32] px-5 font-medium text-white transition hover:bg-[#245542] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole size={17} />
              <span>
                {paymentConfirmed
                  ? "Reservation confirmed"
                  : checkingPayment
                    ? "Verifying payment..."
                    : loading
                      ? "Preparing secure payment..."
                      : `Pay LKR ${formattedAmount}`}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-xs text-[#939A91]">
              Your booking is confirmed only after successful
              payment verification.
            </p>
          </div>
        </section>

        {/* RIGHT: Reservation summary */}
        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded border border-[#E7E5DE] bg-white shadow-sm">
            <div className="bg-[#173D32] px-6 py-6 text-white">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.19em] text-[#BFD0BF]">
                <UtensilsCrossed size={14} />
                The Olive Table
              </div>

              <h2 className="font-serif text-2xl">
                Your reservation
              </h2>

              {bookingReference && (
                <p className="mt-2 text-xs text-[#C2D1C8]">
                  Reference: {bookingReference}
                </p>
              )}
            </div>

            <div className="space-y-5 px-6 py-6">
              {date && (
                <div className="flex items-start gap-3">
                  <CalendarDays
                    size={19}
                    className="mt-0.5 shrink-0 text-[#9B7A49]"
                  />
                  <div>
                    <p className="text-xs text-[#929A91]">
                      Reservation date
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#263C31]">
                      {date}
                    </p>
                  </div>
                </div>
              )}

              {time && (
                <div className="flex items-start gap-3">
                  <Clock3
                    size={19}
                    className="mt-0.5 shrink-0 text-[#9B7A49]"
                  />
                  <div>
                    <p className="text-xs text-[#929A91]">
                      Arrival time
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#263C31]">
                      {time}
                    </p>
                  </div>
                </div>
              )}

              {guests !== undefined && (
                <div className="flex items-start gap-3">
                  <Users
                    size={19}
                    className="mt-0.5 shrink-0 text-[#9B7A49]"
                  />
                  <div>
                    <p className="text-xs text-[#929A91]">
                      Guests
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#263C31]">
                      {guests} {guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>
              )}

              {tableNames && tableNames.length > 0 && (
                <div className="flex items-start gap-3">
                  <UtensilsCrossed
                    size={19}
                    className="mt-0.5 shrink-0 text-[#9B7A49]"
                  />
                  <div>
                    <p className="text-xs text-[#929A91]">
                      Selected tables
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#263C31]">
                      {tableNames.join(", ")}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-dashed border-[#DFE3DC] pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#748075]">
                    Reservation deposit
                  </span>
                  <span className="font-medium text-[#293E32]">
                    LKR {formattedAmount}
                  </span>
                </div>

                <div className="mt-5 border-t border-[#E5E8E2] pt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#879087]">
                    Total due now
                  </p>

                  <p className="mt-2 font-serif text-3xl font-semibold text-[#173D32]">
                    LKR {formattedAmount}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#788678]">
                    This deposit secures your reservation.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 text-xs text-[#7B897D]">
                <LockKeyhole size={14} />
                Secure payment processing
              </div>
            </div>
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#879087]">
            <ShieldCheck size={15} />
            Secure checkout powered by PayHere
          </p>
        </aside>
      </div>
    </div>
  );
}
