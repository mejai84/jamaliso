import { Client } from 'pg'

const run = async () => {
    const client = new Client({
        connectionString: "postgresql://postgres:%40Mejai840316*.@db.ryxqoapxzvssxqdsyfzw.supabase.co:5432/postgres",
        ssl: { rejectUnauthorized: false }
    })

    await client.connect()
    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'order_items'
  `)
    console.log(JSON.stringify(res.rows, null, 2))
    await client.end()
}

run().catch(console.error)
