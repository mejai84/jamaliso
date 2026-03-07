const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ryxqoapxzvssxqdsyfzw.supabase.co";
// Use the PUBLIC ANON KEY (found in some other file if available or use the one I have)
// Wait, I only have the SERVICE_ROLE_KEY. I should use that if possible.
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkyODUxNCwiZXhwIjoyMDg0NTA0NTE0fQ.ExuFNR-UAIScGvNIrb2Iy8hhnq7nuzboMcSVeq_ROpk";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testSignup() {
    const email = `test-api-${Date.now()}@jamali.so`;
    const password = "Password123!";

    console.log(`Testing signup with ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
        // user_metadata removed to test
    });

    if (error) {
        console.error('Signup Error:', error);
    } else {
        console.log('Signup Success:', data.user.id);
        // Delete the test user
        await supabase.auth.admin.deleteUser(data.user.id);
        console.log('Cleanup: User deleted.');
    }
}

testSignup();
