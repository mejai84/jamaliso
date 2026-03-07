const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://ryxqoapxzvssxqdsyfzw.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkyODUxNCwiZXhwIjoyMDg0NTA0NTE0fQ.ExuFNR-UAIScGvNIrb2Iy8hhnq7nuzboMcSVeq_ROpk";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
    const queries = [
        "ALTER TABLE cashbox_sessions ADD COLUMN IF NOT EXISTS closed_with_pending BOOL DEFAULT false",
        "ALTER TABLE cashbox_sessions ADD COLUMN IF NOT EXISTS transferred_to UUID REFERENCES profiles(id)",
        "ALTER TABLE cashbox_sessions ADD COLUMN IF NOT EXISTS transfer_accepted_at TIMESTAMPTZ",
        "ALTER TABLE cashbox_sessions ADD COLUMN IF NOT EXISTS transfer_notes TEXT",

        "CREATE TABLE IF NOT EXISTS shift_handoffs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), restaurant_id UUID REFERENCES restaurants(id), outgoing_session_id UUID REFERENCES cashbox_sessions(id), outgoing_user_id UUID REFERENCES profiles(id), outgoing_at TIMESTAMPTZ DEFAULT now(), physical_cash_counted NUMERIC(12,2) NOT NULL, system_cash_expected NUMERIC(12,2) NOT NULL, cash_difference NUMERIC(12,2) GENERATED ALWAYS AS (physical_cash_counted - system_cash_expected) STORED, incoming_user_id UUID REFERENCES profiles(id), incoming_at TIMESTAMPTZ, incoming_accepted BOOL DEFAULT false, incoming_signature TEXT, pending_tables JSONB DEFAULT '[]', pending_orders JSONB DEFAULT '[]', status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','disputed')), created_at TIMESTAMPTZ DEFAULT now())",

        "ALTER TABLE shift_handoffs ENABLE ROW LEVEL SECURITY",

        "DROP POLICY IF EXISTS \"Staff can view own restaurant handoffs\" ON shift_handoffs",

        "CREATE POLICY \"Staff can view own restaurant handoffs\" ON shift_handoffs FOR ALL USING (true)",

        "CREATE INDEX IF NOT EXISTS idx_handoffs_restaurant ON shift_handoffs(restaurant_id, created_at DESC)",

        "CREATE INDEX IF NOT EXISTS idx_handoffs_status ON shift_handoffs(status) WHERE status = 'pending'"
    ];

    for (let i = 0; i < queries.length; i++) {
        console.log("Running query " + (i + 1) + "/" + queries.length + "...");
        const { error } = await supabase.rpc('query_sql', { query_text: queries[i] });
        if (error) {
            console.error("Error on query " + i + ":", error);
        }
    }
    console.log("Done applying shift_handoffs SQL");
}

run();
