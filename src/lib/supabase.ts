// Configuración de Supabase
import { createClient } from "@supabase/supabase-js";
import { getEnvVar } from "./config";

const supabaseUrl = getEnvVar("SUPABASE_URL");
const supabaseKey = getEnvVar("SUPABASE_KEY");

export const supabase = createClient(supabaseUrl, supabaseKey);
