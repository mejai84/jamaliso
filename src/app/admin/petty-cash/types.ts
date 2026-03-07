export type Employee = {
    id: string
    full_name: string
    role: string
}

export type PettyCashVoucher = {
    id: string
    voucher_number: number
    date: string
    beneficiary_name: string
    cargo: string
    amount: number
    amount_in_words: string
    concept: string
    accounting_code: string
    signature_data: string | null
    category: string
    status?: string
}

export const EXPENSE_CONCEPTS = [
    "Insumos de cocina (Verduras/Frutas)",
    "Insumos de cocina (Carnes/Pescados)",
    "Insumos de cocina (Abarrotes/Secos)",
    "Artículos de limpieza y aseo",
    "Gas o Combustible (Bombona/Recarga)",
    "Servicios Públicos (Agua/Luz/Internet)",
    "Mantenimiento técnico (Estufas/Neveras)",
    "Reparaciones locativas menores",
    "Adelanto de nómina / Prestamos",
    "Pago de transporte / Domicilios externos",
    "Papelería y útiles de oficina",
    "Publicidad y Marketing Digital",
    "Compra de menaje (Platos/Vasos/Cubiertos)",
    "Pago de proveedores ocasionales",
    "Dotación de empleados (Uniformes)",
    "Compra de Hielo y Bebidas externas",
    "Propina para personal de apoyo",
    "Imprevistos de salón / Decoración",
    "Seguros / Impuestos / Permisos",
    "Ems (Seguridad y Bioseguridad)"
];
