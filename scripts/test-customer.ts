import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

async function testCustomerInsert() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    );

    const { data, error } = await supabase
        .from("customers")
        .insert({
            full_name: "Test Customer",
            email: "test@example.com",
            phone: "0771234567",
        })
        .select("id, full_name")
        .single();

    if (error) {
        console.error("Insert failed:", error.message);
        return;
    }

    console.log("Customer created:", data);
    const customerId = data.id;

    console.log("Customer ID:", customerId);

    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 2);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    const { data: reservation, error: reservationError } =
        await supabase
            .from("reservations")
            .insert({
                customer_id: customerId,
                source: "online",
                party_size: 4,
                starts_at: startTime.toISOString(),
                ends_at: endTime.toISOString(),
            })
            .select("id, booking_reference, status")
            .single();

    if (reservationError) {
        console.error("Reservation failed:", reservationError.message);
        return;
    }

    console.log("Reservation created:", reservation);

}

testCustomerInsert().catch(console.error);