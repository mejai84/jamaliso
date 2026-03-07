const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://postgres.ryxqoapxzvssxqdsyfzw:%40Mejai840316*.@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log("Checking columns in 'orders' table...");
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'priority'
        `);

        if (res.rows.length === 0) {
            console.log("Adding column 'priority' to 'orders' table...");
            await pool.query("ALTER TABLE orders ADD COLUMN priority BOOLEAN DEFAULT FALSE");
            console.log("Column 'priority' added successfully.");
        } else {
            console.log("Column 'priority' already exists.");
        }
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await pool.end();
    }
}

migrate();
