import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

console.log("URL:", url);
console.log("KEY:", key?.slice(0, 20), "...");  // prints first 20 chars only

export const supabase = createClient(url, key);
