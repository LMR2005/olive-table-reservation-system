
"use client";

import { useEffect, useState, useRef } from "react";

import VisitDetails from "./VisitDetails";
import GuestDetails from "./GuestDetails";
import ReservationSummary from "./ReservationSummary";
import TableSelection from "./TableSelection";
import { toast } from "sonner";
import { RestaurantTable, TableCombination } from "@/types/reservation";
import PayHereCheckout from "@/app/reservation/PayHereCheckout";


type PendingReservation = {
    reservationId: string;
    paymentToken: string;
    depositAmount: number;
    bookingReference: string;
    guests: number;
    date: string;
    time: string;
    tableNames: string[];
};

function isValidCapacityCombination(
    guests: number,
    capacities: number[]
): boolean {
    const sorted = [...capacities].sort((a, b) => a - b);

    const allowed: number[][] =
        guests <= 2 ? [[2], [4]] :
            guests <= 4 ? [[4]] :
                guests <= 6 ? [[2, 4], [4, 4]] :
                    guests <= 8 ? [[4, 4]] :
                        guests <= 10 ? [[2, 4, 4], [4, 4, 4]] :
                            guests <= 12 ? [[4, 4, 4]] :
                                [];

    return allowed.some(
        (combination) =>
            combination.length === sorted.length &&
            combination.every((capacity, index) => capacity === sorted[index])
    );
}

type ReservationFlowProps = {
    depositPerTable: number;
    tableData: RestaurantTable[];
    tableCombinations: TableCombination[];
};

type SelectedTable = {
    id: number;
    table_number: number;
    capacity: number;
};

export default function ReservationFlow({
    depositPerTable,
    tableData,
    tableCombinations,
}: ReservationFlowProps) {
    const [guests, setGuests] = useState(2);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");

    const [accepted, setAccepted] = useState(false);
    const [preview, setPreview] = useState(false);
    const [verifiedSlot, setVerifiedSlot] = useState<string | null>(null);

    const currentSlot = date && time ? `${date}|${time}` : null;

    const [pendingReservation, setPendingReservation] =
        useState<PendingReservation | null>(null);

    const availabilityVerified =
        currentSlot !== null && verifiedSlot === currentSlot;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const [availabilityRefreshKey, setAvailabilityRefreshKey] = useState(0);

    const [selectedTables, setSelectedTables] =
        useState<SelectedTable[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    useEffect(() => {
        if (guests <= 4) {
            setIsJoined(false);
        }

        setSelectedTables([]);
    }, [guests, date, time]);


    const tableCount = selectedTables.length;

    const totalCapacity = selectedTables.reduce(
        (total, table) => total + table.capacity,
        0
    );


    const selectedCapacities = selectedTables.map(
        (table) => table.capacity
    );

    const validCapacityCombination = isValidCapacityCombination(
        guests,
        selectedCapacities
    );

    const validJoinedPair =
        !isJoined ||
        (selectedTables.length === 2 &&
            tableCombinations.some(
                (combination) =>
                    (combination.table_1_id === selectedTables[0].id &&
                        combination.table_2_id === selectedTables[1].id) ||
                    (combination.table_1_id === selectedTables[1].id &&
                        combination.table_2_id === selectedTables[0].id)
            ));

    const hasValidSelection =
        totalCapacity >= guests &&
        validCapacityCombination &&
        validJoinedPair;


    const deposit = hasValidSelection
        ? selectedTables.reduce((total, table) => {
            const tableDeposit =
                table.capacity === 2
                    ? depositPerTable / 2
                    : depositPerTable;

            return total + tableDeposit;
        }, 0)
        : null;


    const ready = Boolean(
        date &&
        time &&
        name.trim() &&
        email.trim() &&
        phone.trim() &&
        accepted &&
        hasValidSelection &&
        availabilityVerified
    );


    function resetReservationForm() {
        // Visit details
        setGuests(2);
        setDate("");
        setTime("");

        // Customer details
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");

        // Table selection
        setSelectedTables([]);
        setIsJoined(false);

        // Terms and availability
        setAccepted(false);
        setVerifiedSlot(null);

        // Other UI state
        setPreview(false);
    }

    async function handleReservationSubmit() {
        if (submittingRef.current) return;

        if (!hasValidSelection) {
            toast.error("Please select a valid table arrangement.");
            return;
        }

        if (!availabilityVerified) {
            toast.error("Please wait until table availability is verified.");
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);

        try {
            const reservationData = {
                name,
                email,
                phone,
                guests,
                date,
                time,
                tableIds: selectedTables.map((table) => table.id),
                notes,
                isJoined,
            };

            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();

            if (response.status === 409) {
                setAvailabilityRefreshKey((previous) => previous + 1);

                toast.error("Selected table is no longer available", {
                    description:
                        "We've refreshed table availability. Please choose another available table.",
                });

                return;
            }

            if (!response.ok || result.success === false) {
                if (Array.isArray(result.errors) && result.errors.length > 0) {
                    toast.error("Invalid reservation details", {
                        description: result.errors[0].message,
                    });
                } else {
                    toast.error("Reservation failed", {
                        description: result.message || "Please try again.",
                    });
                }

                return;
            }

            if (
                typeof result.reservation_id !== "string" ||
                typeof result.payment_token !== "string" ||
                typeof result.deposit_amount_lkr !== "number" ||
                typeof result.booking_reference !== "string"
            ) {
                throw new Error("Reservation response is incomplete.");
            }


            setPendingReservation({
                reservationId: result.reservation_id,
                paymentToken: result.payment_token,
                depositAmount: result.deposit_amount_lkr,
                bookingReference: result.booking_reference,

                guests,
                date,
                time,
                tableNames: selectedTables.map(
                    (table) => `T${String(table.id).padStart(2, "0")}`
                ),
            });


            toast.success("Reservation held successfully! Please Complete your deposit payment.", {
                description: `Booking reference: ${result.booking_reference}. Payment is required to confirm.`,
            });
            resetReservationForm();

        } catch (error) {
            console.error("Reservation request failed:", error);

            toast.error("Connection error", {
                description: "Unable to verify the reservation result. Please check your booking before retrying.",
            });

        } finally {
            submittingRef.current = false;
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            {pendingReservation ? (
                <PayHereCheckout
                    reservationId={pendingReservation.reservationId}
                    paymentToken={pendingReservation.paymentToken}
                    depositAmount={pendingReservation.depositAmount}
                    bookingReference={pendingReservation.bookingReference}
                    guests={pendingReservation.guests}
                    date={pendingReservation.date}
                    time={pendingReservation.time}
                    tableNames={pendingReservation.tableNames}
                />
            ) : (
                <>
                    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-12">
                        {/* LEFT SIDE */}
                        <div className="space-y-7">

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#A17B49]">01 / Your visit</p>
                                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Find your perfect table</h2>
                                <p className="mt-3 text-sm leading-7 text-[#65746B]">Select your preferred date, time, and party size. We’ll take care of the rest.</p>
                            </div>

                            <VisitDetails
                                date={date}
                                setDate={setDate}
                                guests={guests}
                                setGuests={setGuests}
                                time={time}
                                setTime={setTime}
                                setPreview={setPreview}
                                isSubmitting={isSubmitting}
                            />

                            {date && time && (
                                <TableSelection
                                    guests={guests}
                                    date={date}
                                    time={time}
                                    selectedTables={selectedTables}
                                    setSelectedTables={setSelectedTables}
                                    isJoined={isJoined}
                                    setIsJoined={setIsJoined}
                                    tableData={tableData}
                                    tableCombinations={tableCombinations}
                                    onAvailabilityChange={setVerifiedSlot}
                                    depositPerTable={depositPerTable}
                                    availabilityRefreshKey={availabilityRefreshKey}
                                />
                            )}

                            <div className="pt-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#A17B49]">
                                    02 / Guest details
                                </p>

                                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                                    A few more details
                                </h2>
                            </div>

                            <GuestDetails
                                name={name}
                                setName={setName}
                                email={email}
                                setEmail={setEmail}
                                phone={phone}
                                setPhone={setPhone}
                                notes={notes}
                                setNotes={setNotes}
                                accepted={accepted}
                                setAccepted={setAccepted}
                                ready={ready}
                                onSubmit={() => handleReservationSubmit()}
                                isSubmitting={isSubmitting}
                            />

                        </div>

                        {/* RIGHT SIDE */}
                        <aside className="lg:sticky lg:top-7">

                            <ReservationSummary
                                date={date}
                                time={time}
                                guests={guests}
                                tableCount={tableCount}
                                deposit={deposit}
                                depositPerTable={depositPerTable}
                            />

                            <div className="mt-5 border border-[#E2DED3] bg-[#EFECE3] p-6">
                                <p className="text-[11px] font-bold uppercase tracking-[.15em]">
                                    Good to know
                                </p>

                                <p className="mt-3 text-sm leading-7 text-[#58675D]">
                                    If you’re running late, please contact the restaurant.
                                    A 15-minute grace period was proposed; final
                                    cancellation and refund terms must be approved
                                    before launch.
                                </p>
                            </div>

                        </aside>
                    </div>
                </>
            )}
        </div>
    );
}
