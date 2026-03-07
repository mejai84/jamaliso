import { Client } from 'pg'
import fs from 'fs'

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ryxqoapxzvssxqdsyfzw:%40Mejai840316*.@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

const client = new Client({ connectionString })

async function squashSchema() {
    await client.connect()
    console.log('🔗 Connected to DB')

    // Get all tables in public schema
    const tablesResult = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `)

    let sqlDump = '-- 🚀 JAMALISO OS SQUASHED SCHEMA MIGRATION\n-- Generated on: ' + new Date().toISOString() + '\n\n'
    const schemaJson: Record<string, any> = {}

    for (const row of tablesResult.rows) {
        const table = row.tablename
        console.log(`Processing table: ${table}`)

        // Get columns
        const colsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table])

        schemaJson[table] = colsResult.rows

        sqlDump += `CREATE TABLE IF NOT EXISTS public.${table} (\n`
        const cols = colsResult.rows.map(c => {
            let def = `  ${c.column_name} ${c.data_type}`
            if (c.character_maximum_length) def += `(${c.character_maximum_length})`
            if (c.is_nullable === 'NO') def += ' NOT NULL'
            if (c.column_default) def += ` DEFAULT ${c.column_default}`
            return def
        })
        sqlDump += cols.join(',\n')
        sqlDump += '\n);\n\n'
    }

    // Keep it simple for now, add generic Enable RLS
    for (const row of tablesResult.rows) {
        sqlDump += `ALTER TABLE public.${row.tablename} ENABLE ROW LEVEL SECURITY;\n`
    }

    fs.writeFileSync('./supabase_migrations/20260307000000_jamaliso_initial_schema.sql', sqlDump)
    fs.writeFileSync('./docs/schema_dump_v1.json', JSON.stringify(schemaJson, null, 2))

    console.log('✅ Squashed Schema saved to supabase_migrations/20260307000000_jamaliso_initial_schema.sql')
    console.log('✅ JSON DB Schema saved to docs/schema_dump_v1.json')

    await client.end()
}

squashSchema().catch(console.error)
