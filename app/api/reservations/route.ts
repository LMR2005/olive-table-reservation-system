import { supabaseAdmin } from "@/lib/supabase/admin";
import { reservationSchema } from "@/lib/supabase/validations/reservation";

export async function POST(request: Request) {
    const body = await request.json();

    const result = reservationSchema.safeParse(body);

    if (!result.success) {
        return Response.json(
            {
                success: false,
                message: "Please correct your reservation details.",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            },
            { status: 400 }
        );
    }


    const startsAt = new Date(`${body.date}T${body.time}:00+05:30`);
    const endsAt = new Date(
        startsAt.getTime() + 2 * 60 * 60 * 1000
    );

    const { data, error } = await supabaseAdmin.rpc("create_reservation", {
        p_name: body.name,
        p_email: body.email,
        p_phone: body.phone,
        p_guests: body.guests,
        p_starts_at: startsAt,
        p_ends_at: endsAt,
        p_table_ids: body.tableIds,
        p_notes: body.notes,
        p_is_joined: body.isJoined,
    });


    if (error) {
        console.error("Reservation error:", error);

        if (error.code === "23P01") {
            return Response.json(
                {
                    success: false,
                    message:
                        "One or more selected tables have just been reserved. Please choose another table.",
                },
                { status: 409 }
            );
        }

        return Response.json(
            {
                success: false,
                message: "Unable to create reservation",
            },
            { status: 400 }
        );
    }


    return Response.json(data, { status: 201 });

}