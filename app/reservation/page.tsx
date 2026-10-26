import BookingConfirmationModal from "@/componenets/BookingConfirmationModal";
import Link from "next/link";
import ReservationFlow from "@/componenets/reservation/ReservationFlow";
import { getDepositPerTable, getRestaurantTables, getTableCombinations } from "./settings";
import ReservationLoading from "@/componenets/reservation/ReservationLoading";
import { Suspense } from "react";

const GREEN = "#183B30";

async function ReservationData() {
    const depositPerTable = await getDepositPerTable();
    const tableData = await getRestaurantTables();
    const tableCombinations = await getTableCombinations();
    console.log("PAGE combinations:", tableCombinations);

    return (
        <ReservationFlow depositPerTable={depositPerTable} tableData={tableData} tableCombinations={tableCombinations} />
    );
}


export default function Reservation() {
    return (
        <div>
            <main className="min-h-screen bg-[#F7F3EA] text-[#183B30]">
                <header className="border-b border-[#193D32]/10 bg-[#183B30] text-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10">
                        <Link href="/" className="font-serif text-xl tracking-wide sm:text-2xl">The Olive Table<span className="text-[#D8BC8D]">.</span></Link>
                        <div className="flex items-center gap-5">
                            <Link href="/" className="hidden text-xs uppercase tracking-[.16em] text-white/75 transition hover:text-white sm:block">← Back to home</Link>
                            <span className="border border-white/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.15em] sm:px-5">Reservations</span>
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden bg-[#183B30] text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center opacity-25" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#122E25]/95 via-[#122E25]/70 to-[#122E25]/40" />
                    <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
                        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.34em] text-[#E3C38F]">A seat at our table</p>
                        <h1 className="max-w-3xl font-serif text-5xl leading-[1.09] sm:text-6xl lg:text-7xl">Make time for <em className="font-normal text-[#E3C38F]">something special.</em></h1>
                        <p className="mt-6 max-w-lg text-sm leading-7 text-white/80 sm:text-base">An intimate dinner, an evening with friends, or a celebration to remember. Your table is just a few details away.</p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">

                    <Suspense fallback={<ReservationLoading />}>
                        <ReservationData />
                    </Suspense>

                </section>

                <footer className="bg-[#183B30] px-6 py-9 text-white md:px-10"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><Link href="/" className="font-serif text-xl">The Olive Table<span className="text-[#D8BC8D]">.</span></Link><p className="text-xs text-white/65">Gather, linger, and savor the moment.</p></div></footer>

                {/* <BookingConfirmationModal
                    open={preview}
                    onClose={() => setPreview(false)}
                    name={name}
                    email={email}
                    phone={phone}
                    date={date}
                    time={time}
                    guests={guests}
                    tables={tableCount}
                    deposit={deposit}
                />

                {preview &&
                    <div role="dialog" aria-modal="true" aria-labelledby="reservation-preview-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-5" onClick={() => setPreview(false)}>
                        <div className="w-full max-w-md bg-[#F7F3EA] p-7 shadow-2xl sm:p-10" onClick={e => e.stopPropagation()}><p className="text-[11px] font-bold 
                    uppercase tracking-[.25em] text-[#9A764D]">
                            Reservation preview
                        </p>
                            <h2 id="reservation-preview-title" className="mt-3 font-serif text-4xl">Almost there, {name.trim().split(" ")[0]}.</h2>
                            <p className="mt-5 text-sm leading-7 text-[#5D6C62]">
                                {dateLabel(date)} at {timeLabel(time)} for {guests} {guests === 1 ? "guest" : "guests"}.
                            </p>
                            <div className="mt-5 border-t border-[#D9DED5] pt-5">
                                <p className="text-sm">Estimated deposit: <strong>Rs. {deposit.toLocaleString("en-US")}</strong></p>
                                <p className="mt-3 text-xs leading-6 text-[#748077]">This is an interactive design preview. No table has been reserved,
                                    no payment has been taken, and no confirmation has been sent.</p>
                            </div>
                            <button type="button" className="mt-7 w-full bg-[#183B30] px-6 py-4 text-xs font-bold uppercase tracking-[.16em]
                                     text-white" onClick={() => setPreview(false)}>
                                Return to reservation form
                            </button>
                        </div>
                    </div>*/}
            </main>
        </div>
    )
}
