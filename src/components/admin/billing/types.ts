export interface ElectronicInvoice {
    id: string;
    order_id: string;
    customer_name: string;
    customer_nit: string;
    amount: number;
    status: 'emitida' | 'pendiente' | 'error';
    cufe_uuid?: string;
    created_at: string;
    provider: 'DIAN' | 'SAT';
}
