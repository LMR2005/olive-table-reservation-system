import React from 'react'
import TableSelection from './TableSelection';

const slots = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const timeLabel = (time: string) => {
    if (!time) return "--:--";
    const [h, m] = time.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

type VisitDetialsProps = {
    date: string;
    setDate: (value: string) => void;

    guests: number;
    setGuests: (value: number) => void;

    time: string;
    setTime: (value: string) => void;

    setPreview: (value: boolean) => void;
    isSubmitting: boolean;
};

export default function VisitDetails({
    date,
    setDate,
    guests,
    setGuests,
    time,
    setTime,
    setPreview,
    isSubmitting,
}: VisitDetialsProps) {
    return (
        <div>
            <div className="rounded-sm border border-[#244438]/10 bg-white p-5 shadow-[0_18px_60px_rgba(21,46,35,0.04)] sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                        <span className="mb-3 block text-[11px] font-bold uppercase tracking-[.16em]">Reservation date <span className="text-[#A17B49]">*</span></span>
                        <input disabled={isSubmitting} aria-label="Reservation date" required type="date" value={date} onChange={e => { setDate(e.target.value); setPreview(false); }} className="w-full min-w-0 rounded-none border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-4 text-sm outline-none transition focus:border-[#183B30]" />
                    </label>
                    <label className="block">
                        <span className="mb-3 block text-[11px] font-bold uppercase tracking-[.16em]">Number of guests <span className="text-[#A17B49]">*</span></span>
                        <select disabled={isSubmitting} value={guests} onChange={e => { setGuests(Number(e.target.value)); setPreview(false); }} className="w-full rounded-none border border-[#D9DDD7] bg-[#FCFBF7] px-4 py-4 text-sm outline-none transition focus:border-[#183B30]">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option value={n} key={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
                        </select>
                    </label>
                </div>
                <div className="mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[.16em]">Preferred arrival time <span className="text-[#A17B49]">*</span></p>
                        <span className="text-xs text-[#7F8B82]">Daily · 11:00 AM – 10:00 PM</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {slots.map(slot => (
                            <button key={slot} type="button" disabled={isSubmitting} aria-pressed={time === slot} onClick={() => { if (isSubmitting) return; setTime(slot); setPreview(false); }} className={`border px-2 py-3.5 text-xs font-semibold transition sm:text-sm ${time === slot ? "border-[#183B30] bg-[#183B30] text-white" : "border-[#D9DDD7] bg-[#FCFBF7] text-[#2F493E] hover:border-[#183B30]"}`}>
                                {timeLabel(slot)}
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-xs leading-6 text-[#758178]">Times shown are illustrative. Live table availability will be checked once the booking backend is connected.</p>
                </div>
                {guests > 4 && <div className="mt-6 border-l-2 border-[#B9945B] bg-[#F8F4EB] px-4 py-3 text-sm leading-6 text-[#52665A]">For larger parties, we may arrange adjoining tables. Our team will confirm the configuration when booking is enabled.</div>}
            </div>
        </div>
    )
}
