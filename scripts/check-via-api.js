import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://ryxqoapxzvssxqdsyfzw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFvYXB4enZzc3hxZHN5Znp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5Mjg1MTQsImV4cCI6MjA4NDUwNDUxNH0.QW2zFiXhXvsP0IeuT_aJy7KDmJJwOjgT2k8SIEmPK3w'
)

async function check() {
    const { data, error } = await supabase.from('order_items').select('*').limit(1)
    console.log('Error:', error)
    if (data && data.length > 0) {
        console.log('Campos existentes en un order_item:')
        console.log(Object.keys(data[0]))
    } else {
        // Intentaremos un insert falso solo para ver el error de validación
        const res = await supabase.from('order_items').insert({ id: 'dummy' })
        console.log('Insert intent:', res.error?.message)
    }
}

check()
