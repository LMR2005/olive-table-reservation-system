"use client";

import { useEffect, useRef } from "react";

type BookingConfirmationModalProps = {
    open: boolean;
    onClose: () => void;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    tables: number;
    deposit: number;
};

function readableDate(value: string) {
    if (!value) return "Not selected";
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
    }).format(new Date(year, month - 1, day));
}

function readableTime(value: string) {
    if (!value) return "Not selected";
    const [hours, minutes] = value.split(":").map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export default function BookingConfirmationModal({
    open, onClose, name, email, phone, date, time, guests, tables, deposit,
}: BookingConfirmationModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0B211A]/75 px-4 py-7 backdrop-blur-[5px]"
            onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-confirmation-heading"
                aria-describedby="booking-confirmation-description"
                className="relative my-auto w-full max-w-[510px] overflow-hidden rounded-[3px] bg-[#FBF9F3] text-[#183B30] shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close booking preview"
                    className="absolute right-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>

                <div
                    className="relative overflow-hidden bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85')"
                    }}>
                    {/* Dark green overlay */}
                    <div className="absolute inset-0 bg-[#102D24]/90" />
                    <div className="relative z-10 px-7 pb-8 pt-9 text-center text-white sm:px-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#D9BA85]">The Olive Table</p>
                        <div className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full border border-[#D9BA85]/60 bg-white/5 text-[#D9BA85]">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
                        </div>
                        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#D9BA85]">Booking details preview</p>
                        <h2 id="booking-confirmation-heading" className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">Your evening awaits.</h2>
                        <p id="booking-confirmation-description" className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/75">Please review your reservation details before proceeding.</p>
                    </div>
                </div>

                <div className="px-6 py-7 sm:px-10">
                    <div className="mb-5 flex items-center justify-between border-b border-[#DDDCD2] pb-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A17B49]">Guest</p>
                            <p className="mt-1 font-serif text-xl">{name || "Guest"}</p>
                        </div>
                        <span className="border border-[#B08B5D]/40 bg-[#F4EEDF] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#876B42]">Demo only</span>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-[#DDDCD2] pb-6">
                        <div><dt className="text-[10px] font-bold uppercase tracking-widest text-[#7A897D]">Date</dt><dd className="mt-1.5 text-sm font-semibold">{readableDate(date)}</dd></div>
                        <div><dt className="text-[10px] font-bold uppercase tracking-widest text-[#7A897D]">Arrival</dt><dd className="mt-1.5 text-sm font-semibold">{readableTime(time)}</dd></div>
                        <div><dt className="text-[10px] font-bold uppercase tracking-widest text-[#7A897D]">Party size</dt><dd className="mt-1.5 text-sm font-semibold">{guests} {guests === 1 ? "guest" : "guests"}</dd></div>
                        <div><dt className="text-[10px] font-bold uppercase tracking-widest text-[#7A897D]">Estimated tables</dt><dd className="mt-1.5 text-sm font-semibold">{tables} {tables === 1 ? "table" : "tables"}</dd></div>
                    </dl>
                    <div className="space-y-1 border-b border-[#DDDCD2] py-5">
                        <p className="break-words text-xs text-[#68766B]">{email}</p>
                        <p className="text-xs text-[#68766B]">{phone}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-5">
                        <div><p className="text-sm font-medium">Estimated deposit</p><p className="mt-1 text-xs text-[#7A897D]">Rs. 1,000 per estimated table</p></div>
                        <strong className="whitespace-nowrap font-serif text-2xl font-normal">Rs. {deposit.toLocaleString("en-US")}</strong>
                    </div>
                    <div className="border-l-2 border-[#B99664] bg-[#F1EBDD] px-4 py-3 text-xs leading-5 text-[#5A675A]">
                        Running late? Please contact the restaurant before your arrival time. The final grace-period and refund policy will be provided when live bookings are enabled.
                    </div>
                    <p className="mt-4 text-center text-xs leading-5 text-[#8B6850]">This is a design preview. No table has been reserved, no payment has been taken, and no confirmation has been sent.</p>
                    <button type="button" onClick={onClose} className="mt-5 w-full bg-[#183B30] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#285343] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B30]">Back to reservation form</button>
                </div>
            </section>
        </div>
    );
}
