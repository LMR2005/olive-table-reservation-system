
import { z } from "zod";

export const reservationSchema = z
  .object({
    // Customer name
    name: z
      .string({ error: "Please enter your full name." })
      .trim()
      .min(1, "Full name is required.")
      .max(150, "Full name cannot exceed 150 characters."),

    // Email address
    email: z.email({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Email address is required."
          : "Please enter a valid email address, such as name@example.com.",
    }),

    // Phone number
    phone: z
      .string({ error: "Please enter your phone number." })
      .trim()
      .min(1, "Phone number is required.")
      .regex(
        /^\+?[0-9\s-]{9,15}$/,
        "Please enter a valid phone number, such as 0771234567 or +94771234567."
      ),

    // Number of guests
    guests: z
      .number({
        error: "Please select the number of guests.",
      })
      .int("The number of guests must be a whole number.")
      .min(1, "Please select at least 1 guest.")
      .max(12, "A maximum of 12 guests is allowed."),

    // Reservation date
    date: z.iso.date({
      error: "Please select a valid reservation date.",
    }),

    // Reservation time (24-hour format)
    time: z
      .string({
        error: "Please select your preferred arrival time.",
      })
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Please select a valid arrival time."
      ),

    // Selected restaurant tables
    tableIds: z
      .array(
        z.number({
          error: "The selected table is invalid.",
        })
          .int("The selected table ID must be a whole number.")
          .positive("The selected table ID is invalid."),
        { error: "Please select your table." }
      )
      .min(1, "Please select at least one table.")
      .max(3, "You can select a maximum of three tables."),

    // Joined or separate arrangement
    isJoined: z.boolean({
      error: "Please select your seating arrangement.",
    }),

    // Optional special requests
    notes: z
      .string({
        error: "Please enter valid special requests.",
      })
      .max(
        1000,
        "Special requests cannot exceed 1000 characters."
      )
      .optional(),
  })
  .superRefine((value, ctx) => {
    // Prevent duplicate table IDs
    if (
      new Set(value.tableIds).size !== value.tableIds.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "You cannot select the same table more than once.",
        path: ["tableIds"],
      });
    }

    // Joining requires exactly two tables
    if (value.isJoined && value.tableIds.length !== 2) {
      ctx.addIssue({
        code: "custom",
        message: "Please select two tables for joined seating.",
        path: ["tableIds"],
      });
    }

    // Multiple separate tables require at least five guests
    if (
      !value.isJoined &&
      value.tableIds.length > 1 &&
      value.guests <= 4
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "For four or fewer guests, please select one table. Contact the restaurant for a special seating arrangement.",
        path: ["tableIds"],
      });
    }

    // Prevent reservations for past dates
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.date)) {
      const selectedDate = value.date;
      const todayInSriLanka = new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Colombo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(new Date());

      if (selectedDate < todayInSriLanka) {
        ctx.addIssue({
          code: "custom",
          message: "Please select today or a future date.",
          path: ["date"],
        });
      }
    }
  });

export type ReservationInput = z.infer<
  typeof reservationSchema
>;
