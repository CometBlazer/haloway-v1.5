// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./../DatabaseDefinitions.ts"
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public"

// Debug: Log the variables
// console.log("Supabase URL:", PUBLIC_SUPABASE_URL)
// console.log("Supabase Key exists:", !!PUBLIC_SUPABASE_ANON_KEY)

if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    `Missing Supabase environment variables. 
    PUBLIC_SUPABASE_URL: ${PUBLIC_SUPABASE_URL ? "exists" : "missing"}
    PUBLIC_SUPABASE_ANON_KEY: ${PUBLIC_SUPABASE_ANON_KEY ? "exists" : "missing"}`,
  )
}

export const supabase = createClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
)
