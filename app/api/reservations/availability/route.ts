import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

{/* Zod validation */ }
const availabilitySchema = z.object({
    date: z.iso.date({
        error: "Please select a valid reservation date.",
    }),
    time: z.string({
        error: "Please select an arrival time.",
    }).regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Please select a valid arrival time."
    ),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const validation = availabilitySchema.safeParse({
        date,
        time,
    });

    {/* Validation Error display */ }
    if (!validation.success) {
        return Response.json(
            {
                success: false,
                message: validation.error.issues[0]?.message
                    ?? "Invalid date or time.",
            },
            { status: 400 }
        );
    }

    const { date: validDate, time: validTime } = validation.data;
    const startsAt = new Date(
        `${validDate}T${validTime}:00+05:30`
    );
    const endsAt = new Date(
        startsAt.getTime() + 2 * 60 * 60 * 1000
    );
    {/* Check whether the start time in future */ }
    if (
        Number.isNaN(startsAt.getTime()) ||
        startsAt <= new Date()
    ) {
        return Response.json(
            {
                success: false,
                message: "Please select a future reservation date and time.",
            },
            { status: 400 }
        );
    }

    {/* Run the get_booked_tables function */ }
    const { data, error } = await supabaseAdmin.rpc(
        "get_booked_tables",
        {
            p_starts_at: startsAt.toISOString(),
            p_ends_at: endsAt.toISOString(),
        }
    );
    if (error) {
        console.error("Table availability error:", error);

        return Response.json(
            {
                success: false,
                message: "Unable to check table availability.",
            },
            { status: 500 }
        );
    }
    const bookedTableIds = (data ?? []).map(
        (item:any) => item.table_id
    );

    return Response.json({
        success: true,
        bookedTableIds,
    });
}