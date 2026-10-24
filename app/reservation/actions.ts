"use server";

import { createClient } from "@/lib/supabase/server";

export async function createCustomer() {
  const supabase = await createClient();

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
    return { success: false, error: error.message };
  }

  return { success: true, customer: data };
}