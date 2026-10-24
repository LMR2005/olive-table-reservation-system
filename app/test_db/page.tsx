import { createClient } from "@/lib/supabase/server";


export default async function TestDatabase() {
  const supabase = await createClient();

  const { data: tables, error } = await supabase
    .from("restaurant_tables")
    .select("id, table_number, capacity");

  if (error) {
    return (
      <div className="p-10">
        <h1>Database Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <main className="p-10"> 
      <h1 className="mb-6 text-3xl font-bold">
        The Olive Table — Database Test
      </h1>

      <p>Tables found: {tables?.length ?? 0}</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {tables?.map((table) => (
          <div
            key={table.id}
            className="rounded-lg border p-4"
          >
            <h2>Table {table.table_number}</h2>
            <p>Capacity: {table.capacity}</p>
          </div>
        ))}
      </div>
    </main>
  );
}