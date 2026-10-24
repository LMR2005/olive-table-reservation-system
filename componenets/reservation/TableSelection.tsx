import { useState, useEffect } from "react";
import { Users, CheckCircle2, CircleAlert, XCircle, LoaderCircle, Check, CalendarX2, X } from "lucide-react";
import { RestaurantTable, SelectedTable, TableCombination } from "@/types/reservation";

type TableSelectionProps = {
  guests: number;
  date: string;
  time: string;
  depositPerTable: number;
  selectedTables: SelectedTable[];
  setSelectedTables: React.Dispatch<React.SetStateAction<SelectedTable[]>>;
  isJoined: boolean;
  setIsJoined: (value: boolean) => void;
  tableData: RestaurantTable[];
  tableCombinations: TableCombination[];
  onAvailabilityChange: (slot: string | null) => void;
  availabilityRefreshKey: number;
};

const floorPositions = [
  // Four-seat tables
  { table_number: 1, x: 27.3, y: 24.5 },
  { table_number: 2, x: 40.2, y: 24.5 },
  { table_number: 3, x: 60.0, y: 24.5 },
  { table_number: 4, x: 73.0, y: 24.5 },

  { table_number: 5, x: 27.3, y: 45.5 },
  { table_number: 6, x: 40.2, y: 45.5 },
  { table_number: 7, x: 60.0, y: 45.5 },
  { table_number: 8, x: 73.0, y: 45.5 },

  { table_number: 9, x: 43.7, y: 66.0 },
  { table_number: 10, x: 56.5, y: 66.0 },

  // Two-seat tables
  { table_number: 11, x: 18.0, y: 8.5 },
  { table_number: 12, x: 50.0, y: 8.5 },
  { table_number: 13, x: 82.0, y: 8.5 },

  { table_number: 14, x: 91.5, y: 31.5 },
  { table_number: 15, x: 91.5, y: 57 },
];

function getAllowedCapacities(guests: number): number[][] {
  if (guests <= 2) return [[2], [4]];
  if (guests <= 4) return [[4]];
  if (guests <= 6) return [[2, 4], [4, 4]];
  if (guests <= 8) return [[4, 4]];
  if (guests <= 10) return [[2, 4, 4], [4, 4, 4]];
  if (guests <= 12) return [[4, 4, 4]];
  return [];
}

function canAddTable(
  selectedCapacities: number[],
  newCapacity: number,
  guests: number
): boolean {
  const next = [...selectedCapacities, newCapacity];

  return getAllowedCapacities(guests).some((combination) => {
    const remaining = [...combination];

    return next.every((capacity) => {
      const index = remaining.indexOf(capacity);

      if (index === -1) return false;

      remaining.splice(index, 1);
      return true;
    });
  });
}


export default function TableSelection({
  guests,
  date,
  time,
  depositPerTable,
  selectedTables,
  setSelectedTables,
  isJoined,
  setIsJoined,
  tableData,
  tableCombinations,
  onAvailabilityChange,
  availabilityRefreshKey,
}: TableSelectionProps) {
  const floorTables = floorPositions.flatMap((position) => {
    const table = tableData.find(
      (item) => item.table_number === position.table_number
    );

    if (!table) return [];

    return [{ ...table, x: position.x, y: position.y }];
  });
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [bookedTableIds, setBookedTableIds] = useState<number[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  console.log("Table combinations:", tableCombinations);

  const areTablesJoinable = (
    firstTableId: number,
    secondTableId: number
  ): boolean => {
    return (tableCombinations ?? []).some((combination) => {
      return (
        (combination.table_1_id === firstTableId &&
          combination.table_2_id === secondTableId) ||
        (combination.table_1_id === secondTableId &&
          combination.table_2_id === firstTableId)
      );
    });
  };



  useEffect(() => {
    let controller: AbortController | null = null;
    let active = true;
    let requestId = 0;

    async function fetchAvailability() {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;
      const currentRequestId = ++requestId;

      setAvailabilityLoading(true);
      setAvailabilityError(null);
      onAvailabilityChange(null);

      try {
        const params = new URLSearchParams({ date, time });

        const response = await fetch(
          `/api/reservations/availability?${params.toString()}`,
          {
            signal: currentController.signal,
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success ||
          !Array.isArray(result.bookedTableIds)) {
          throw new Error(
            result.message || "Unable to check table availability."
          );
        }

        if (!active || currentController.signal.aborted ||
          currentRequestId !== requestId) return;

        setBookedTableIds(result.bookedTableIds);
        setAvailabilityError(null);

        // Remove tables that became booked
        setSelectedTables((currentTables) =>
          currentTables.filter(
            (table) => !result.bookedTableIds.includes(table.id)
          )
        );

        onAvailabilityChange(`${date}|${time}`);
      } catch (error) {
        if (!active || currentController.signal.aborted ||
          currentRequestId !== requestId) return;

        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Unable to check table availability."
        );
        onAvailabilityChange(null);
      } finally {
        if (active && !currentController.signal.aborted &&
          currentRequestId === requestId) {
          setAvailabilityLoading(false);
        }
      }
    }

    if (date && time) {
      fetchAvailability();
    }

    const interval = setInterval(() => {
      if (date && time) fetchAvailability();
    }, 30000);

    return () => {
      active = false;
      controller?.abort();
      clearInterval(interval);
    };
  }, [date, time, onAvailabilityChange, availabilityRefreshKey]);


  const activeTable = floorTables.find(
    (table) => table.id === hoveredTable
  );

  const hoveredReason = activeTable
    ? !activeTable.is_active
      ? "inactive"
      : availabilityLoading
        ? "checking"
        : availabilityError
          ? "availabilityError"
          : bookedTableIds.includes(activeTable.id)
            ? "booked"
            : isJoined &&
              selectedTables.length === 1 &&
              !selectedTables.some((t) => t.id === activeTable.id) &&
              !areTablesJoinable(selectedTables[0].id, activeTable.id)
              ? "notJoinable"
              : guests <= 4 && activeTable.capacity < guests
                ? "insufficient"
                : !selectedTables.some((t) => t.id === activeTable.id) &&
                  guests > 4 &&
                  !canAddTable(
                    selectedTables.map((t) => t.capacity),
                    activeTable.capacity,
                    guests
                  )
                  ? "invalidCombination"
                  : null
    : null;


  const hoverStatus = (() => {
    switch (hoveredReason) {
      case "inactive":
        return {
          title: "Table unavailable",
          description: "This table is currently out of service.",
          icon: XCircle,
          color: "text-[#66736B]",
          background: "bg-[#F0F1EF]",
        };

      case "checking":
        return {
          title: "Checking availability",
          description: "Please wait while we check this table.",
          icon: LoaderCircle,
          color: "text-[#65746B]",
          background: "bg-[#F0F1EF]",
        };

      case "availabilityError":
        return {
          title: "Availability unavailable",
          description: "We couldn't verify this table. Please try again.",
          icon: CircleAlert,
          color: "text-[#B65F4F]",
          background: "bg-[#FFF1ED]",
        };

      case "notJoinable":
        return {
          title: "Tables cannot be joined",
          description:
            "This table cannot be physically joined with your selected table.",
          icon: CircleAlert,
          color: "text-[#A17B49]",
          background: "bg-[#FFF7E8]",
        };

      case "booked":
        return {
          title: "Already reserved",
          description: "This table is booked for your selected time.",
          icon: CalendarX2,
          color: "text-[#B65F4F]",
          background: "bg-[#FFF1ED]",
        };

      case "insufficient":
        return {
          title: "Insufficient seating capacity",
          description:
            "This table cannot accommodate your selected party arrangement.",
          icon: CircleAlert,
          color: "text-[#B65F4F]",
          background: "bg-[#FFF1ED]",
        };

      case "invalidCombination":
        return {
          title: "Arrangement not available",
          description:
            "This table cannot be added to your current selection.",
          icon: CircleAlert,
          color: "text-[#A17B49]",
          background: "bg-[#FFF7E8]",
        };

      default:
        return {
          title: "Available for selection",
          description: "Click to select this table.",
          icon: CheckCircle2,
          color: "text-[#277A51]",
          background: "bg-[#EDF6EF]",
        };
    }
  })();

  const StatusIcon = hoverStatus.icon;

  return (
    <section className="mt-8 border border-[#244438]/10 bg-white p-6">
      <h3 className="font-serif text-2xl text-[#183B30]">
        Choose Your Table
      </h3>

      <p className="mt-2 text-sm text-[#65746B]">
        Available tables for {guests} guests on {date} at {time}.
      </p>


      {/* Seating Arrangement */}
      {guests >= 5 && (
        <div className="mt-6 rounded-xl border border-[#183B30]/10 bg-[#F7F3EA]/60 p-4 sm:p-5">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-[#183B30]">
              Seating Arrangement
            </h4>
            <p className="mt-1 text-sm text-[#65746B]">
              How would you prefer your tables to be arranged?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Separate Tables */}
            <button
              type="button"
              aria-pressed={!isJoined}
              onClick={() => {
                setIsJoined(false);
                setSelectedTables([]);
              }}
              className={`flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all duration-200 ${!isJoined
                ? "border-[#183B30] bg-[#183B30]/5"
                : "border-[#183B30]/10 bg-white hover:border-[#183B30]/40"
                }`}
            >
              <div>
                <p className="font-semibold text-[#183B30]">
                  Separate Tables
                </p>
                <p className="mt-1 text-xs text-[#65746B]">
                  Tables remain in their original positions.
                </p>
              </div>

              <span
                className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${!isJoined
                  ? "border-[#183B30] bg-[#183B30]"
                  : "border-[#A9B4AB]"
                  }`}
              >
                {!isJoined && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
            </button>

            {/* Joined Tables */}
            <button
              type="button"
              aria-pressed={isJoined}
              onClick={() => {
                setIsJoined(true);
                setSelectedTables([]);
              }}
              className={`flex items-center justify-between rounded-lg border-2 p-4 text-left transition-all duration-200 ${isJoined
                ? "border-[#183B30] bg-[#183B30]/5"
                : "border-[#183B30]/10 bg-white hover:border-[#183B30]/40"
                }`}
            >
              <div>
                <p className="font-semibold text-[#183B30]">
                  Joined Tables
                </p>
                <p className="mt-1 text-xs text-[#65746B]">
                  Tables arranged together for your group.
                </p>
              </div>

              <span
                className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isJoined
                  ? "border-[#183B30] bg-[#183B30]"
                  : "border-[#A9B4AB]"
                  }`}
              >
                {isJoined && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#65746B]">
            {isJoined
              ? "Only approved table combinations can be joined."
              : "Select your preferred table or available separate seating arrangement."}
          </p>
        </div>)}


      <div className="mt-6 overflow-hidden rounded-xl border border-[#183B30]/15 bg-[#F7F3EA] p-2 sm:p-4">
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg">
          <img
            src="/images/restaurant-floor-plan.png"
            alt="Top-down restaurant floor plan showing tables T01 to T15"
            className="block h-auto w-full select-none"
            draggable={false}
          />

          {floorTables.map((table) => {
            const isSelected = selectedTables.some(
              (selected) => selected.id === table.id
            );

            const isBooked = bookedTableIds.includes(table.id);

            const invalidJoiningPartner =
              isJoined &&
              selectedTables.length === 1 &&
              !isSelected &&
              !areTablesJoinable(selectedTables[0].id, table.id);

            const selectedCapacities = selectedTables
              .filter((selected) => selected.id !== table.id)
              .map((selected) => selected.capacity);

            const insufficientCapacity =
              !isSelected &&
              guests <= 4 &&
              table.capacity < guests;

            const isInactive = !table.is_active;

            const invalidCombination =
              !isSelected &&
              guests > 4 &&
              !canAddTable(
                selectedCapacities,
                table.capacity,
                guests
              );

            const unavailableReason = isInactive
              ? "inactive"
              : isBooked
                ? "booked"
                : insufficientCapacity
                  ? "insufficient"
                  : invalidCombination
                    ? "invalidCombination"
                    : null;

            const canSelectTable =
              !availabilityLoading &&
              !availabilityError &&
              !isInactive &&
              !isBooked &&
              !insufficientCapacity &&
              !invalidCombination &&
              !invalidJoiningPartner;

            return (
              <button
                key={table.id}
                type="button"
                aria-label={`Select table T${String(table.table_number).padStart(2, "0")}, ${table.capacity} seats`}
                aria-pressed={isSelected}
                title={`Table T${String(table.table_number).padStart(2, "0")} — ${table.capacity} seats`}
                aria-disabled={unavailableReason !== null}
                onMouseEnter={() => setHoveredTable(table.id)}
                onMouseLeave={() => setHoveredTable(null)}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTables(
                      selectedTables.filter((selected) => selected.id !== table.id)
                    );
                    return;
                  }

                  if (!canSelectTable) return;

                  const newTable = {
                    id: table.id,
                    table_number: table.table_number,
                    capacity: table.capacity,
                  };

                  if (guests <= 4) {
                    setSelectedTables([newTable]);
                    return;
                  }

                  setSelectedTables([...selectedTables, newTable]);
                }}


                className={`absolute z-10 flex items-center justify-center
                  -translate-x-1/2 -translate-y-1/2 
                  rounded-lg border-2 transition-all duration-200
                  ${isInactive
                    ? "cursor-not-allowed border-[#9BA29B] bg-white/15"
                    : isBooked
                      ? "cursor-not-allowed border-[#A95349] bg-[#A95349]/20"
                      : insufficientCapacity || invalidCombination
                        ? "cursor-not-allowed border-[#9BA29B] bg-white/15"
                        : isSelected
                          ? "cursor-pointer border-[#D9B878] bg-[#D9B878]/40 ring-2 ring-[#D9B878]"
                          : "cursor-pointer border-transparent bg-transparent"
                  }`}
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  width:
                    table.table_number === 14 || table.table_number === 15
                      ? "5%"
                      : table.capacity === 4
                        ? "8%"
                        : "6%",
                  height:
                    table.table_number === 14 || table.table_number === 15
                      ? "8%"
                      : table.capacity === 4 ? "9%" : "7%",
                }}
              >

                {isInactive ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6B7370] shadow-md">
                    <X className="h-5 w-5 text-white" />
                  </span>
                ) : isBooked ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A95349] shadow-md">
                    <CalendarX2 className="h-4 w-4 text-white" />
                  </span>
                ) : isSelected ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9B878] shadow-md">
                    <Check className="h-5 w-5 text-[#183B30]" />
                  </span>
                ) : null}


              </button>
            );
          })}


          {activeTable && (
            <div
              className="
      pointer-events-none absolute z-30
      w-60 rounded-2xl border border-[#E5E9E1]
      bg-white/95 p-4 text-left
      shadow-[0_16px_45px_rgba(18,46,37,0.18)]
      backdrop-blur-md
      sm:w-64
    "
              style={{
                left: `${activeTable.x}%`,
                top: `${activeTable.y}%`,
                transform:
                  activeTable.y < 25
                    ? "translate(-50%, 25%)"
                    : "translate(-50%, -115%)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A17B49]">
                    The Olive Table
                  </p>

                  <h4 className="mt-1 font-serif text-xl text-[#183B30]">
                    Table T{String(activeTable.table_number).padStart(2, "0")}
                  </h4>
                </div>

                <div className={`rounded-full p-2 ${hoverStatus.background}`}>
                  <StatusIcon className={`h-4 w-4 ${hoverStatus.color}`} />
                </div>
              </div>

              {/* Table details */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E6EAE3] pt-3">
                <div>
                  <p className="text-[11px] text-[#758078]">Seating</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[#183B30]">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">
                      {activeTable.capacity} guests
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-[#758078]">Deposit</p>

                  <p className="mt-1 text-sm font-semibold text-[#183B30]">
                    Rs.{" "}
                    {(
                      activeTable.capacity === 2
                        ? depositPerTable / 2
                        : depositPerTable
                    ).toLocaleString("en-LK")}
                  </p>

                </div>
              </div>

              {/* Availability status */}

              <div
                className={`mt-4 flex items-start gap-2.5 rounded-xl px-3 py-3 ${hoverStatus.background}`}
              >
                <StatusIcon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${hoverStatus.color}`}
                />

                <div>
                  <p className={`text-xs font-semibold ${hoverStatus.color}`}>
                    {hoverStatus.title}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#65746B]">
                    {hoverStatus.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-[#65746B]">
          {availabilityLoading
            ? "Checking table availability..."
            : availabilityError
              ? availabilityError
              : `Booked table IDs: ${bookedTableIds.join(", ") || "None"}`}
        </p>
      </div>




    </section>
  );
}