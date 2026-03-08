import { getPosStatus } from '@/actions/pos';
import { createClient } from '@/lib/supabase/server';

// Mock the createClient module
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

describe('POS - Server Actions (getPosStatus)', () => {
    const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retorna false para hasActiveShift si no hay turno', async () => {
        // Simulamos un supabase instanciado con respuestas prefabricadas
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'usuario-123' } } })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            // maybeSingle retorna null o data
                            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
                        })
                    })
                })
            })
        };

        // Asignamos que createClient devuelva nustro mock
        mockCreateClient.mockResolvedValue(mockSupabase as any);

        const result = await getPosStatus('usuario-123');

        // Verificamos lógica de negocio según el retorno validado
        expect(result.hasActiveShift).toBe(false);
        expect(result.activeShift).toBeNull();
        expect(result.hasOpenCashbox).toBe(false);
        expect(result.canSell).toBe(false);
    });

    test('retorna true para canSell si el turno y caja estatus existen', async () => {
        // Configuración de Mocks de base de datos Encadenados
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'usuario-123' } } })
            },
            from: jest.fn().mockImplementation((table: string) => {
                if (table === 'shifts') {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'shift-1' }, error: null })
                                })
                            })
                        })
                    };
                }
                if (table === 'cashbox_sessions') {
                    return {
                        select: jest.fn().mockReturnValue({
                            eq: jest.fn().mockReturnValue({
                                eq: jest.fn().mockReturnValue({
                                    maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'session-1' }, error: null })
                                })
                            })
                        })
                    };
                }
            })
        };

        mockCreateClient.mockResolvedValue(mockSupabase as any);

        const result = await getPosStatus('usuario-123');

        // Verificaciones críticas de negocio POS
        expect(result.hasActiveShift).toBe(true);
        expect(result.activeShift).toEqual({ id: 'shift-1' });
        expect(result.hasOpenCashbox).toBe(true);
        expect(result.activeCashboxSession).toEqual({ id: 'session-1' });
        expect(result.canSell).toBe(true);
    });
});
