import "server-only";

import { createClient } from "@/lib/supabase/server";
import { create } from "domain";

export async function getDepositPerTable() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurant_settings")
    .select("deposit_per_table_lkr")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error("Unable to load restaurant deposit");
  }

  return data.deposit_per_table_lkr;
}

export async function getRestaurantTables() {
  const supabase = await createClient();

  const {data, error} = await supabase
    .from("restaurant_tables")
    .select("id, table_number, capacity, booking_channel, is_active")
    .order("table_number", {ascending: true});

  if (error) {
    throw new Error("Unable to Retrieve Restaurant Information")
  }

  return data;
}

export async function getTableCombinations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("table_combinations")
    .select("id, table_1_id, table_2_id, is_active")
    .eq("is_active", true);

  if (error) {
    throw new Error("Unable to retrieve table combinations");
  }

  return data;
}