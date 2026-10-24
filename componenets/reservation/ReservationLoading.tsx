
import { LoaderCircle, UtensilsCrossed } from "lucide-react";

export default function ReservationLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#122E25]/85 px-5 backdrop-blur-md"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#D8BC8D]/30 bg-[#183B30] px-8 py-12 text-center shadow-2xl">
        {/* Decorative corner accents */}
        <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-[#D8BC8D]/45" />
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-[#D8BC8D]/45" />

        {/* Brand icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D8BC8D]/35 bg-white/5">
          <UtensilsCrossed className="h-7 w-7 text-[#D8BC8D]" />
        </div>

        {/* Restaurant name */}
        <h2 className="mt-7 font-serif text-3xl tracking-wide text-white">
          The Olive Table
          <span className="text-[#D8BC8D]">.</span>
        </h2>

        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D8BC8D]">
          A seat at our table
        </p>

        {/* Loader */}
        <div className="mt-9 flex justify-center">
          <LoaderCircle className="h-7 w-7 animate-spin text-[#D8BC8D]" />
        </div>

        <p className="mt-5 text-sm text-white/85">
          Preparing your reservation
        </p>

        <p className="mt-2 text-xs text-white/50">
          Loading tables and seating arrangements...
        </p>
      </div>
    </div>
  );
}
