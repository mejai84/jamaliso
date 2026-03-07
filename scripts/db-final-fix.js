const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ryxqoapxzvssxqdsyfzw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkyODUxNCwiZXhwIjoyMDg0NTA0NTE0fQ.ExuFNR-UAIScGvNIrb2Iy8hhnq7nuzboMcSVeq_ROpk";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
    const queries = [
        // 1. Permitive INSERT for restaurants to ANY authenticated user
        "DROP POLICY IF EXISTS \"Allow authenticated insert\" ON public.restaurants",
        "CREATE POLICY \"Allow authenticated insert\" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (true)",

        // 2. Clear all failed test accounts so they can be reused
        "DELETE FROM public.profiles WHERE email ILIKE '%master-test%' OR email ILIKE '%estelar%' OR email ILIKE '%prod-wizard%' OR email ILIKE '%oasis%'",
        "DELETE FROM auth.users WHERE email ILIKE '%master-test%' OR email ILIKE '%estelar%' OR email ILIKE '%prod-wizard%' OR email ILIKE '%oasis%'",
        "DELETE FROM public.restaurants WHERE subdomain ILIKE '%estelar%' OR subdomain ILIKE '%oasis%'"
    ];

    for (let i = 0; i < queries.length; i++) {
        console.log(`Running query ${i + 1}/${queries.length}: ${queries[i]}`);
        const { data, error } = await supabase.rpc('exec_sql', { query: queries[i] });
        if (error) {
            console.error(`RPC Error on query ${i}:`, error);
        } else if (data && data.status === 'error') {
            console.error(`PostgreSQL Error on query ${i}:`, data.message);
        } else {
            console.log("Success.");
        }
    }
}

run();
