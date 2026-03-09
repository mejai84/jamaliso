export interface DianTax {
    id: number; // 1: IVA, 2: Impoconsumo
    name: string;
    rate: number;
    tax_amount: string;
    taxable_amount: string;
}

export interface DianLine {
    unit_measure_id: number; // 70: Unidad
    line_extension_amount: string;
    free_of_charge_indicator: boolean;
    allowance_charges: any[];
    tax_totals: DianTax[];
    description: string;
    notes: string;
    code: string;
    item_id: number;
    price_amount: string;
    base_quantity: string;
}

export interface DianCustomer {
    identification_number: string;
    dv: string;
    name: string;
    phone: string;
    address: string;
    email: string;
    merchant_registration: string;
    type_document_identification_id: number; // 3: CC, 6: NIT, 10: Consumidor Final
    type_organization_id: number; // 1: Persona Juridica, 2: Persona Natural
    type_regime_id: number; // 1: Responsable IVA, 2: No responsable
    type_liability_id: number;
    municipality_id: number;
}

export interface DianPaymentForm {
    payment_form_id: number; // 1: Contado, 2: Credito
    payment_method_id: number; // 10: Efectivo, 47: Transferencia
    payment_due_date: string;
    duration_measure: string;
}

export interface DianCashInformation {
    plate_number: string;
    location: string;
    cashier: string;
    cash_type: string;
    sales_code: string;
    subtotal_sales: string;
}

export interface DianSoftwareManufacturer {
    name: string;
    business_name: string;
    software_name: string;
}

export interface DianDocument {
    type_document_id: number; // 1: Factura, 15: POS Electronico
    resolution_number: string;
    prefix: string;
    number: string;
    date: string;
    time: string;
    notes: string;
    send_email: boolean;
    customer: DianCustomer;
    payment_form: DianPaymentForm;
    allowance_charges: any[];
    tax_totals: DianTax[];
    legal_monetary_totals: {
        line_extension_amount: string;
        tax_exclusive_amount: string;
        tax_inclusive_amount: string;
        allowance_total_amount: string;
        charge_total_amount: string;
        payable_amount: string;
    };
    invoice_lines: DianLine[];
    // Specific for POS Documento Equivalente
    test_set_id?: string;
    cash_information?: DianCashInformation;
    software_manufacturer?: DianSoftwareManufacturer;
    buyer_benefits?: {
        code: string;
        name: string;
        points: string;
    };
}
