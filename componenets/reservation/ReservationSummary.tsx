import React from 'react'

const dateLabel = (date: string) => {
    if (!date) return "Choose a date";

    const [y, m, d] = date.split("-").map(Number);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(new Date(y, m - 1, d));
};

const timeLabel = (time: string) => {
    if (!time) return "--:--";

    const [h, m] = time.split(":").map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"
        }`;
};

type ReservationSummaryProps = {
    date: string;
    time: string;
    guests: number;
    tableCount: number;
    deposit: number | null;
    depositPerTable : number;
};

export default function ReservationSummary({
    date,
    time,
    guests,
    tableCount,
    deposit,
    depositPerTable,
}: ReservationSummaryProps) {
    return (
        <div>
            <div className="overflow-hidden border border-[#244438]/10 bg-white">
                <div className="bg-[#183B30] p-7 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-[#DBBD89]">The Olive Table</p>
                    <h3 className="mt-3 font-serif text-3xl">Your reservation</h3>
                    <p className="mt-2 text-xs leading-6 text-white/70">A wonderful experience awaits.</p>
                </div>
                <div className="space-y-5 p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-3 border-b border-[#E5E9E3] pb-4"><span className="text-sm text-[#718077]">Date</span><span className="text-right text-sm font-semibold">{dateLabel(date)}</span></div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E5E9E3] pb-4"><span className="text-sm text-[#718077]">Time</span><span className="text-sm font-semibold">{timeLabel(time)}</span></div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E5E9E3] pb-4"><span className="text-sm text-[#718077]">Party size</span><span className="text-sm font-semibold">{guests} {guests === 1 ? "guest" : "guests"}</span></div>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E5E9E3] pb-4"><span className="text-sm text-[#718077]">Estimated tables</span><span className="text-sm font-semibold">{tableCount}</span></div>
                    {deposit !== null ? (
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold">
                                Total deposit
                            </span>

                            <strong className="font-serif text-3xl">
                                Rs. {deposit.toLocaleString("en-US")}
                            </strong>
                        </div>
                    ) : (
                        <p className="text-xs leading-6 text-[#77837A]">
                            Rs. 0.00
                        </p>
                    )}
                    <p className="text-xs leading-6 text-[#77837A]">Illustrative estimate: Rs. {depositPerTable} per table. Final charges depend on confirmed table allocation.</p>
                </div>
            </div>
        </div>
    );
}

