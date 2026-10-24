import React from 'react'
import { LoaderCircle } from "lucide-react";

type GuestDetailsProps = {
    name: string;
    setName: (value: string) => void;

    email: string;
    setEmail: (value: string) => void;

    phone: string;
    setPhone: (value: string) => void;

    notes: string;
    setNotes: (value: string) => void;

    accepted: boolean;
    setAccepted: (value: boolean) => void;

    ready: boolean;
    onSubmit: () => void;

    isSubmitting: boolean;
};

export default function GuestDetails({
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    accepted,
    setAccepted,
    ready,
    onSubmit,
    isSubmitting,
}: GuestDetailsProps) {

    return (
        <div>
            <form className="space-y-5 rounded-sm border border-[#244438]/10 bg-white p-5 sm:p-8" onSubmit={(e) => {
                e.preventDefault();

                if (ready) {
                    onSubmit();
                }
            }} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block sm:col-span-2"><span className="mb-2 block text-xs font-semibold">Full name *</span><input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#183B30]" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-semibold">Email address *</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#183B30]" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-semibold">Phone number *</span><input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+94 7X XXX XXXX" className="w-full border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#183B30]" /></label>
                </div>
                <label className="block"><span className="mb-2 block text-xs font-semibold">Special requests <span className="font-normal text-[#77837A]">(optional)</span></span><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="A special occasion, accessibility needs, or anything we should know…" className="w-full resize-y border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-3.5 text-sm outline-none focus:border-[#183B30]" /></label>
                <label className="flex cursor-pointer items-start gap-3 text-xs leading-6 text-[#5B6A61]"><input checked={accepted} onChange={e => setAccepted(e.target.checked)} required type="checkbox" className="mt-1 accent-[#183B30]" /><span>I understand that the reservation deposit and late-arrival policy will be clearly disclosed before a real payment is requested.</span></label>
                <button type="submit" disabled={!ready || isSubmitting} className="w-full bg-[#183B30] px-6 py-4 text-xs font-bold uppercase tracking-[.18em] text-white transition hover:bg-[#285343] disabled:cursor-not-allowed disabled:opacity-40">
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Processing reservation...
                        </span>
                    ) : (
                        "Reserve Table"
                    )}
                    <span aria-hidden="true">↗</span></button>
                <p className="text-center text-xs leading-5 text-[#77837A]">Prototype only — no booking or payment will be processed.</p>
            </form>
        </div>
    )
}
