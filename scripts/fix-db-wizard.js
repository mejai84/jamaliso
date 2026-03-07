const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ryxqoapxzvssxqdsyfzw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkyODUxNCwiZXhwIjoyMDg0NTA0NTE0fQ.ExuFNR-UAIScGvNIrb2Iy8hhnq7nuzboMcSVeq_ROpk";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
    const queries = [
        // 1. Expand allowed roles constraint
        "ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check",
        "ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'owner', 'super_admin', 'manager', 'cashier', 'waiter', 'kitchen', 'customer', 'mesero', 'cocinero', 'cajero'))",

        // 2. Set search_path for log_audit_event for safety (avoid 500 errors)
        "ALTER FUNCTION public.log_audit_event() SET search_path = public"
    ];

    for (let i = 0; i < queries.length; i++) {
        console.log(`Running query ${i + 1}/${queries.length}...`);
        const { error } = await supabase.rpc('query_sql', { query_text: queries[i] });
        if (error) {
            console.error(`Error on query ${i}:`, error);
        } else {
            console.log("Success.");
        }
    }
}

run();
