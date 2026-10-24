"use client";

import { useMemo, useState } from "react";

type BookingStatus = "Confirmed" | "Seated" | "Completed" | "Cancelled" | "No-show";
type Reservation = {
  id: string;
  guest: string;
  phone: string;
  email: string;
  time: string;
  guests: number;
  tables: number[];
  status: BookingStatus;
  notes: string;
  deposit: number;
};

const startingReservations: Reservation[] = [
  { id: "OT-1041", guest: "Nethmi Perera", phone: "+94 77 123 4567", email: "nethmi@example.com", time: "11:30", guests: 2, tables: [11], status: "Completed", notes: "Window seat requested", deposit: 1000 },
  { id: "OT-1042", guest: "Kasun Fernando", phone: "+94 71 222 3344", email: "kasun@example.com", time: "12:00", guests: 4, tables: [2], status: "Seated", notes: "Birthday lunch", deposit: 1000 },
  { id: "OT-1043", guest: "Amaya Silva", phone: "+94 76 314 1592", email: "amaya@example.com", time: "13:00", guests: 3, tables: [3], status: "Confirmed", notes: "Vegetarian guest", deposit: 1000 },
  { id: "OT-1044", guest: "Ravindu Jayasuriya", phone: "+94 77 321 6789", email: "ravindu@example.com", time: "15:30", guests: 8, tables: [5, 6], status: "Confirmed", notes: "Tables should be joined", deposit: 2000 },
  { id: "OT-1045", guest: "Dilani Jayawardena", phone: "+94 70 449 2014", email: "dilani@example.com", time: "17:00", guests: 2, tables: [12], status: "Confirmed", notes: "Anniversary", deposit: 1000 },
  { id: "OT-1046", guest: "Imesha Wickramasinghe", phone: "+94 75 833 6142", email: "imesha@example.com", time: "18:30", guests: 4, tables: [8], status: "Confirmed", notes: "No special requests", deposit: 1000 },
  { id: "OT-1047", guest: "Dinuka Rathnayake", phone: "+94 77 543 2501", email: "dinuka@example.com", time: "19:00", guests: 2, tables: [13], status: "Cancelled", notes: "Customer cancelled", deposit: 1000 },
  { id: "OT-1048", guest: "Sanjana De Alwis", phone: "+94 71 905 7721", email: "sanjana@example.com", time: "19:30", guests: 4, tables: [9], status: "Confirmed", notes: "High chair requested", deposit: 1000 },
  { id: "OT-1049", guest: "Harith Madushan", phone: "+94 76 775 8123", email: "harith@example.com", time: "20:00", guests: 2, tables: [14], status: "No-show", notes: "Did not arrive", deposit: 1000 },
];

const allTables = Array.from({ length: 15 }, (_, i) => ({
  number: i + 1,
  seats: i < 10 ? 4 : 2,
  allocation: i < 9 ? "Online" : "Walk-in",
}));

const formatTime = (value: string) => {
  const [hours, mins] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(mins).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const statusClass: Record<BookingStatus, string> = {
  Confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  Seated: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Completed: "bg-stone-100 text-stone-600 ring-stone-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  "No-show": "bg-amber-50 text-amber-800 ring-amber-200",
};

export default function StaffDashboard() {
  const [reservations, setReservations] = useState(startingReservations);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [activeSection, setActiveSection] = useState("Overview");
  const [walkInTables, setWalkInTables] = useState<number[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  const results = useMemo(() => reservations.filter((r) =>
    (filter === "All" || r.status === filter) &&
    `${r.guest} ${r.id} ${r.phone}`.toLowerCase().includes(search.toLowerCase())
  ), [reservations, filter, search]);

  const confirmed = reservations.filter((r) => r.status === "Confirmed").length;
  const seated = reservations.filter((r) => r.status === "Seated").length;
  const guestCount = reservations.filter((r) => !["Cancelled", "No-show"].includes(r.status)).reduce((n, r) => n + r.guests, 0);
  const occupiedTables = [...new Set(reservations.filter((r) => r.status === "Seated").flatMap((r) => r.tables).concat(walkInTables))];

  const updateStatus = (id: string, status: BookingStatus) => {
    setReservations((old) => old.map((r) => r.id === id ? { ...r, status } : r));
    setSelected((old) => old?.id === id ? { ...old, status } : old);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#183B30] antialiased">
      <div className="flex min-h-screen">
        <aside className={`${mobileMenu ? "flex" : "hidden"} fixed inset-y-0 left-0 z-40 w-[252px] flex-col bg-[#15392E] text-white lg:sticky lg:top-0 lg:flex lg:h-screen`}>
          <div className="border-b border-white/10 px-7 py-8">
            <p className="font-serif text-2xl tracking-tight">The Olive Table<span className="text-[#D8B77C]">.</span></p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.26em] text-white/55">Staff workspace</p>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-7">
            {[["Overview", "▦"], ["Reservations", "▤"], ["Table Management", "◫"]].map(([name, symbol]) => (
              <button key={name} onClick={() => {setActiveSection(name); setMobileMenu(false);}} className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm transition ${activeSection === name ? "bg-white/12 font-semibold text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
                <span className="text-xl" aria-hidden>{symbol}</span>{name}
              </button>
            ))}
          </nav>
          <div className="border-t border-white/10 px-7 py-6">
            <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-[#D8B77C] font-semibold text-[#15392E]">ST</div><div><p className="text-sm font-semibold">Staff Member</p><p className="text-xs text-white/50">Demo environment</p></div></div>
          </div>
        </aside>

        {mobileMenu && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileMenu(false)}/>}

        <main className="min-w-0 flex-1">
          <header className="flex min-h-[85px] items-center justify-between border-b border-[#E9E5DB] bg-white px-5 sm:px-10">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-[#E7E1D5] p-2 lg:hidden" aria-label="Open navigation" onClick={() => setMobileMenu(true)}>☰</button>
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A906F]">The Olive Table</p><p className="mt-1 font-serif text-xl sm:text-2xl">{activeSection}</p></div>
            </div>
            <div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:inline">● Demo data</span><div className="flex size-9 items-center justify-center rounded-full border border-[#DDDACF] font-semibold">S</div></div>
          </header>
          <div className="mx-auto max-w-[1450px] space-y-8 px-5 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B08A55]">Restaurant operations</p><h1 className="font-serif text-3xl sm:text-4xl">A thoughtful welcome, every time.</h1><p className="mt-2 text-sm text-[#78877F]">Manage today's bookings and seating in one place.</p></div><div className="rounded-lg border border-[#E4E0D6] bg-white px-4 py-3 text-sm font-medium">Illustrative service day · 18 Oct 2026</div></div>

            {activeSection !== "Table Management" && <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-5">
              {[["Total reservations", reservations.length, "All booking records"], ["Awaiting arrival", confirmed, "Confirmed bookings"], ["Guests seated", seated, "Active seated groups"], ["Expected guests", guestCount, "Excludes cancellations / no-shows"]].map(([label, value, note]) => <div key={label} className="rounded-xl border border-[#E9E5DD] bg-white p-5 shadow-[0_3px_24px_rgba(10,35,27,0.025)] sm:p-6"><p className="text-xs font-semibold uppercase tracking-wider text-[#7D8B82]">{label}</p><p className="mt-4 font-serif text-4xl text-[#15392E]">{value}</p><p className="mt-2 text-[11px] text-[#8F998F]">{note}</p></div>)}
            </div>}

            {activeSection !== "Reservations" && <section className="rounded-xl border border-[#E7E2D8] bg-white p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl">Table availability</h2><p className="mt-1 text-xs text-[#839087]">Illustrative table state · walk-in toggles are local to this page</p></div><span className="rounded-full bg-[#F4F0E6] px-3 py-2 text-xs font-semibold text-[#6A6C58]">15 tables · 50 seats</span></div>
              <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#66776D]"><span>● <span className="text-emerald-700">Available</span></span><span>● <span className="text-amber-700">Occupied</span></span><span>● <span className="text-blue-700">Upcoming reservation</span></span><span className="text-[#B08A55]">Online allocation: 9 · Walk-in: 6</span></div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-8">
                {allTables.map((table) => {
                  const isOccupied = occupiedTables.includes(table.number);
                  const isBooked = reservations.some((r) => r.status === "Confirmed" && r.tables.includes(table.number));
                  const isWalkIn = table.allocation === "Walk-in";
                  return <button key={table.number} type="button" onClick={() => isWalkIn && setWalkInTables((old) => old.includes(table.number) ? old.filter((v) => v !== table.number) : [...old, table.number])} title={isWalkIn ? "Toggle mock walk-in occupancy" : "Online allocated table"} className={`rounded-lg border px-2 py-4 text-center transition ${isOccupied ? "border-amber-200 bg-amber-50" : isBooked ? "border-blue-200 bg-blue-50" : "border-[#E1E8DD] bg-[#F5F9F3]"} ${isWalkIn ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}><div className="text-lg">♧</div><div className="mt-1 text-sm font-bold">T{String(table.number).padStart(2,"0")}</div><p className="mt-1 text-[10px] text-[#819088]">{table.seats} seats</p><p className="mt-1 text-[9px] uppercase tracking-wide text-[#9A9C88]">{isWalkIn ? "Walk-in" : "Online"}</p></button>;
                })}
              </div>
              <p className="mt-4 text-xs text-[#89958C]">Note: upcoming bookings are shown without time-slot scheduling. This is a UI mockup, not live table availability.</p>
            </section>}

            {activeSection !== "Table Management" && <section className="overflow-hidden rounded-xl border border-[#E7E2D8] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFECE5] p-5 sm:p-7"><div><h2 className="font-serif text-2xl">Reservations</h2><p className="mt-1 text-xs text-[#839087]">Select a row to view details and update its mock status.</p></div><label className="w-full sm:w-auto"><span className="sr-only">Search reservations</span><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search guest, phone, reference..." className="w-full rounded-lg border border-[#E7E2D8] bg-[#FCFBF8] px-4 py-3 text-sm outline-none transition focus:border-[#B59B6E] sm:w-[280px]"/></label></div>
              <div className="flex gap-2 overflow-x-auto border-b border-[#EFECE5] px-5 py-4 sm:px-7">{["All", "Confirmed", "Seated", "Completed", "Cancelled", "No-show"].map((f) => <button key={f} onClick={()=>setFilter(f)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${filter===f ? "bg-[#183B30] text-white" : "bg-[#F5F4F0] text-[#65766B] hover:bg-[#EAEDE7]"}`}>{f}</button>)}</div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#FAF9F5] text-[11px] uppercase tracking-[0.13em] text-[#87928B]"><tr><th className="px-6 py-4 font-semibold">Time</th><th className="px-6 py-4 font-semibold">Guest</th><th className="px-6 py-4 font-semibold">Party</th><th className="px-6 py-4 font-semibold">Tables</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-[#F0EEE8]">{results.map((r) => <tr key={r.id} className="transition hover:bg-[#FAFBF8]"><td className="px-6 py-5 font-semibold">{formatTime(r.time)}</td><td className="px-6 py-5"><p className="font-semibold">{r.guest}</p><p className="mt-1 text-xs text-[#98A098]">{r.id}</p></td><td className="px-6 py-5">{r.guests} guests</td><td className="px-6 py-5">{r.tables.map((t)=>`T${t}`).join(" + ")}</td><td className="px-6 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass[r.status]}`}>{r.status}</span></td><td className="px-6 py-5"><button onClick={()=>setSelected(r)} className="font-semibold text-[#967340] underline-offset-4 hover:underline">View details →</button></td></tr>)}{results.length===0&&<tr><td colSpan={6} className="px-6 py-12 text-center text-[#87928B]">No reservations match your search.</td></tr>}</tbody></table></div>
            </section>}
            <div className="border-t border-[#E5E0D6] pt-5 text-xs leading-6 text-[#87928B]">The Olive Table · Staff dashboard prototype. All names, phone numbers, payment amounts and bookings are fictional. No changes are saved or sent to guests.</div>
          </div>
        </main>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081D15]/65 p-4" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelected(null);}} role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="reservation-heading" className="w-full max-w-lg overflow-hidden rounded-xl bg-[#FBFAF6] shadow-2xl"><div className="flex items-start justify-between bg-[#183B30] p-7 text-white"><div><p className="text-[10px] uppercase tracking-[0.25em] text-[#D8B77C]">Booking reference · {selected.id}</p><h2 id="reservation-heading" className="mt-3 font-serif text-3xl">{selected.guest}</h2></div><button aria-label="Close booking details" onClick={()=>setSelected(null)} className="rounded-full border border-white/40 px-3 py-2 text-white hover:bg-white/15">✕</button></div><div className="space-y-5 p-7"><div className="grid grid-cols-2 gap-5 text-sm"><div><p className="text-xs uppercase text-[#849087]">Arrival</p><p className="mt-1 font-semibold">{formatTime(selected.time)}</p></div><div><p className="text-xs uppercase text-[#849087]">Party size</p><p className="mt-1 font-semibold">{selected.guests} guests</p></div><div><p className="text-xs uppercase text-[#849087]">Tables</p><p className="mt-1 font-semibold">{selected.tables.map((t)=>`T${t}`).join(" + ")}</p></div><div><p className="text-xs uppercase text-[#849087]">Mock deposit</p><p className="mt-1 font-semibold">Rs. {selected.deposit.toLocaleString("en-LK")}</p></div></div><div className="border-t border-[#E6E1D8] pt-4 text-sm"><p>{selected.phone}</p><p className="mt-1 text-[#7D8981]">{selected.email}</p><p className="mt-4 rounded-lg bg-[#F0EBDD] px-4 py-3 text-[#6C6556]">{selected.notes}</p></div><div className="border-t border-[#E6E1D8] pt-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#839087]">Update status (demo)</p><div className="flex flex-wrap gap-2">{(["Confirmed","Seated","Completed","Cancelled","No-show"] as BookingStatus[]).map((status)=><button key={status} onClick={()=>updateStatus(selected.id,status)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selected.status===status ? "border-[#183B30] bg-[#183B30] text-white" : "border-[#DDD9CE] bg-white hover:border-[#183B30]"}`}>{status}</button>)}</div></div><button onClick={()=>setSelected(null)} className="w-full bg-[#D8B77C] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#183B30] hover:bg-[#E5C991]">Done</button></div></section></div>}
    </div>
  );
}
