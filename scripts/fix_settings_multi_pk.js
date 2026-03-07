const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://ryxqoapxzvssxqdsyfzw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkyODUxNCwiZXhwIjoyMDg0NTA0NTE0fQ.ExuFNR-UAIScGvNIrb2Iy8hhnq7nuzboMcSVeq_ROpk";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
    console.log("Setting missing restaurant IDs to default...");
    const { error: e1 } = await supabase.rpc('query_sql', {
        query_text: "UPDATE settings SET restaurant_id = 'd8616ce5-7651-44ea-814a-96f09e32e8be' WHERE restaurant_id IS NULL"
    });
    if (e1) { console.error(e1); return; }

    console.log("Setting not null...");
    const { error: e2 } = await supabase.rpc('query_sql', {
        query_text: "ALTER TABLE settings ALTER COLUMN restaurant_id SET NOT NULL"
    });
    if (e2) { console.error(e2); return; }

    console.log("Dropping pkey...");
    const { error: e3 } = await supabase.rpc('query_sql', {
        query_text: "ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey"
    });
    if (e3) { console.error(e3); return; }

    console.log("Adding composite pkey...");
    const { error: e4 } = await supabase.rpc('query_sql', {
        query_text: "ALTER TABLE settings ADD PRIMARY KEY (restaurant_id, key)"
    });
    if (e4) { console.error(e4); return; }

    console.log("Done!");
}
run();
