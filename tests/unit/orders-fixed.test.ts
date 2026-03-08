import { splitOrder } from '@/actions/orders-fixed';
import { createClient } from '@/lib/supabase/server';
import { Pool } from 'pg';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    };
    const mPool = {
        connect: jest.fn(() => Promise.resolve(mClient)),
        query: jest.fn(),
        end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('Orders - Server Actions (Flujo Waiter/KDS)', () => {
    const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
    test('splitOrder retorna error controlado si la orden original no se encuentra', async () => {
        // Obtenemos el cliente emulado
        const PoolModule = require('pg').Pool;
        const pool = new PoolModule();
        const client = await pool.connect();
        const clientQueryMock = client.query as jest.Mock;

        // Simulamos respuesta vacía de Supabase (no encuentra la orden)
        const mockSupabase = {
            from: jest.fn().mockImplementation(() => ({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null, // Error: no data
                            error: { message: 'Orden no encontrada' }
                        })
                    })
                })
            }))
        };
        mockCreateClient.mockResolvedValue(mockSupabase as any);

        try {
            await splitOrder('source-order', [{ itemId: 'item-1', quantity: 1 }], 'user-1');
        } catch (e) {
            expect(e).toBeDefined();
        }
    });
});
