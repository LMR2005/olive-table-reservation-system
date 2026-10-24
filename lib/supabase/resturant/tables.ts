import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getRestaurantTables() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurant_tables")
    .select("id, table_number, capacity")
    .order("table_number", { ascending: true });

  if (error) {
    throw new Error("Unable to load restaurant tables");
  }

  return data;
}