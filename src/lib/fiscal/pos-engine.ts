import { DianDocument, DianLine, DianTax } from './types';
import { createClient } from '@/lib/supabase/server';

/**
 * JAMALI OS Fiscal Engine
 * Transforma una orden interna en un documento legal DIAN (Factura o POS Electrónico).
 */
export class PosFiscalEngine {

    /**
     * Mapea una orden de JAMALISO al formato JSON de la DIAN Anexo 1.9
     */
    static async transformOrderToDian(order: any, settings: any, isPos: boolean = true): Promise<DianDocument> {
        const now = new Date();

        // 1. Mapeo de Líneas de Factura (Productos)
        const invoice_lines: DianLine[] = order.order_items.map((item: any, index: number) => {
            const subtotal = Number(item.unit_price) * item.quantity;
            const taxRate = item.tax_rate || 0;
            const taxAmount = (subtotal * taxRate) / 100;
            const total = subtotal + taxAmount;

            const tax: DianTax = {
                id: taxRate === 19 ? 1 : 2, // 1: IVA, 2: IC
                name: taxRate === 19 ? 'IVA' : 'INC',
                rate: taxRate,
                tax_amount: taxAmount.toFixed(2),
                taxable_amount: subtotal.toFixed(2)
            };

            return {
                unit_measure_id: 70, // Unidad
                line_extension_amount: subtotal.toFixed(2),
                free_of_charge_indicator: false,
                allowance_charges: [],
                tax_totals: [tax],
                description: item.products?.name || 'Producto del Menú',
                notes: '',
                code: item.products?.sku || `SKU-${item.product_id?.substring(0, 6)}`,
                item_id: index + 1,
                price_amount: Number(item.unit_price).toFixed(2),
                base_quantity: item.quantity.toString()
            };
        });

        // 2. Cálculos Globales
        const lineExtensionTotal = invoice_lines.reduce((acc, curr) => acc + Number(curr.line_extension_amount), 0);
        const taxTotal = invoice_lines.reduce((acc, curr) => acc + Number(curr.tax_totals[0].tax_amount), 0);
        const payableAmount = lineExtensionTotal + taxTotal;

        // 3. Mapeo del Cliente (Consumidor Final por defecto)
        const customer = order.customers ? {
            identification_number: order.customers.nit || '222222222222',
            dv: '1',
            name: order.customers.name || 'CONSUMIDOR FINAL',
            phone: order.customers.phone || '0000000',
            address: order.customers.address || 'Calle Principal',
            email: order.customers.email || 'consumidorfinal@jamaliso.com',
            merchant_registration: '0000',
            type_document_identification_id: order.customers.nit ? (order.customers.nit.length > 10 ? 6 : 3) : 10,
            type_organization_id: 2, // Persona Natural por defecto
            type_regime_id: 2, // No responsable IVA por defecto
            type_liability_id: 117, // No responsable
            municipality_id: 820 // Armenia (Quindío) por defecto
        } : {
            identification_number: '222222222222',
            dv: '1',
            name: 'CONSUMIDOR FINAL',
            phone: '3333333',
            address: 'Ventas de Mostrador',
            email: settings.email || 'fiscal@jamaliso.com',
            merchant_registration: '0000',
            type_document_identification_id: 10,
            type_organization_id: 2,
            type_regime_id: 2,
            type_liability_id: 117,
            municipality_id: 820
        };

        // 4. Construcción del Documento Base
        const doc: DianDocument = {
            type_document_id: isPos ? 15 : 1, // 15: POS Electrónico, 1: Factura
            resolution_number: settings.resolucion_number || '18760000001',
            prefix: settings.fiscal_prefix || 'JAM',
            number: (settings.current_number + 1).toString(),
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().split(' ')[0],
            notes: `Orden JAMALISO: ${order.id}`,
            send_email: true,
            customer,
            payment_form: {
                payment_form_id: 1, // Contado
                payment_method_id: order.payment_method === 'cash' ? 10 : 47,
                payment_due_date: now.toISOString().split('T')[0],
                duration_measure: '0'
            },
            allowance_charges: [],
            tax_totals: [
                {
                    id: 1,
                    name: 'IVA',
                    rate: 19,
                    taxable_amount: lineExtensionTotal.toFixed(2),
                    tax_amount: taxTotal.toFixed(2)
                }
            ],
            legal_monetary_totals: {
                line_extension_amount: lineExtensionTotal.toFixed(2),
                tax_exclusive_amount: lineExtensionTotal.toFixed(2),
                tax_inclusive_amount: payableAmount.toFixed(2),
                allowance_total_amount: '0.00',
                charge_total_amount: '0.00',
                payable_amount: payableAmount.toFixed(2)
            },
            invoice_lines
        };

        // 5. Inyección de datos específicos de POS (Anexo 1.9)
        if (isPos) {
            doc.cash_information = {
                plate_number: settings.cash_plate_number || 'TERMINAL-01',
                location: settings.city || 'Sede Principal',
                cashier: order.profiles?.name || 'CAJERO SISTEMA',
                cash_type: 'principal',
                sales_code: `${doc.prefix}-${doc.number}`,
                subtotal_sales: payableAmount.toFixed(2)
            };

            doc.software_manufacturer = {
                name: 'JAMALISO SAS',
                business_name: 'Jaime Jaramillo Dev',
                software_name: 'JAMALI OS ERP'
            };

            // Programa de Lealtad (Si aplica)
            if (order.loyalty_points_earned) {
                doc.buyer_benefits = {
                    code: order.customer_id || 'GUEST',
                    name: 'PROGRAMA FIDELIDAD JAMALISO',
                    points: order.loyalty_points_earned.toString()
                };
            }
        }

        return doc;
    }

    /**
     * Envía el documento electrónico al Proveedor Tecnológico.
     * Soporta modo Síncrono y Asíncrono (Contingencia).
     */
    static async transmitToDian(document: DianDocument, apiToken: string, isContingency: boolean = false) {
        // En una implementación real, aquí haríamos el fetch a la API del proveedor
        // Para esta demo, simularemos la respuesta exitosa o el ZipKey.

        const endpoint = isContingency
            ? `https://api.jamaliso-fiscal.com/v1/eqd-invoice/${document.test_set_id || ''}`
            : `https://api.jamaliso-fiscal.com/v1/invoice`;

        console.log(`🚀 Transmitiendo a la DIAN (${isContingency ? 'MODO ASINCRONO' : 'SÍNCRONO'})...`);

        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 1200));

        if (isContingency) {
            return {
                success: true,
                message: "Documento en cola de contingencia.",
                zipKey: `ZIP-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
            };
        }

        return {
            success: true,
            cufe: `CUFE-${Math.random().toString(36).substring(2, 20).toUpperCase()}`,
            qr_url: "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentKey=...",
            xml_url: "https://storage.jamaliso.com/invoices/xml/..."
        };
    }
}
