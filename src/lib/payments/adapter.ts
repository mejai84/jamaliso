/**
 * Unified Payment Adapter - JAMALI OS
 * Supports: Mercado Pago, Nequi, Stripe, Wompi, Card Terminal, Bank Transfer
 * Version: 2.0 · Multi-gateway · Enable/disable per restaurant
 */

export type PaymentGateway =
    | 'wompi'
    | 'mercadopago'
    | 'stripe'
    | 'nequi'
    | 'card_terminal'
    | 'bank_transfer'
    | 'manual'

export interface PaymentRequest {
    amount: number
    currency: string
    orderId: string
    customerEmail?: string
    description: string
    restaurantId: string
    customerPhone?: string  // Para Nequi QR
}

export interface PaymentResponse {
    success: boolean
    paymentUrl?: string
    transactionId?: string
    qrCode?: string          // Para Nequi / QR-based payments
    bankDetails?: BankDetails // Para transferencia bancaria
    error?: string
}

export interface BankDetails {
    bank: string
    accountNumber: string
    accountType: string
    holderName: string
    reference: string
}

export interface GatewayStatus {
    id: PaymentGateway
    enabled: boolean
    mode: 'sandbox' | 'production'
    configured: boolean  // Si tiene credenciales necesarias
}

class PaymentAdapter {

    /**
     * Genera un link de pago, QR o datos bancarios para el método indicado
     */
    async createPayment(gateway: PaymentGateway, request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        console.log(`[PaymentAdapter v2] Creating ${gateway} payment — Order ${request.orderId} — ${request.amount} ${request.currency}`)

        switch (gateway) {
            case 'wompi':
                return this.handleWompi(request, credentials)
            case 'mercadopago':
                return this.handleMercadoPago(request, credentials)
            case 'stripe':
                return this.handleStripe(request, credentials)
            case 'nequi':
                return this.handleNequi(request, credentials)
            case 'card_terminal':
                return this.handleCardTerminal(request)
            case 'bank_transfer':
                return this.handleBankTransfer(request, credentials)
            case 'manual':
                return { success: true, transactionId: `MANUAL-${Date.now()}` }
            default:
                return { success: false, error: `Gateway "${gateway}" not supported` }
        }
    }

    // ── WOMPI (Colombia · Bancolombia) ─────────────────────────────────────────
    private async handleWompi(request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        const pubKey = credentials?.public_key || process.env.WOMPI_PUBLIC_KEY || ''
        const baseUrl = credentials?.mode === 'production'
            ? 'https://checkout.wompi.co/p/'
            : 'https://checkout-staging.wompi.co/p/'

        const params = new URLSearchParams({
            'public-key': pubKey,
            'currency': request.currency || 'COP',
            'amount-in-cents': String(Math.round(request.amount * 100)),
            'reference': request.orderId,
            'redirect-url': `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirm`,
        })

        return {
            success: true,
            paymentUrl: `${baseUrl}?${params.toString()}`,
            transactionId: `WOMPI-${request.orderId}`
        }
    }

    // ── MERCADO PAGO (LATAM) ───────────────────────────────────────────────────
    private async handleMercadoPago(request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        // Para producción real se debe llamar a la API de Mercado Pago
        // con el Access Token para crear una Preference
        const accessToken = credentials?.api_secret || process.env.MERCADOPAGO_ACCESS_TOKEN || ''

        if (!accessToken) {
            return { success: false, error: 'MercadoPago Access Token no configurado' }
        }

        // Simulación del flujo real (en prod se hace fetch a la API de MP):
        // POST https://api.mercadopago.com/checkout/preferences
        // Headers: { Authorization: `Bearer ${accessToken}` }
        // Body: { items: [...], back_urls: {...} }
        return {
            success: true,
            paymentUrl: `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=DEMO-${request.orderId}`,
            transactionId: `MP-${request.orderId}`
        }
    }

    // ── STRIPE (Global / España / Europa) ─────────────────────────────────────
    private async handleStripe(request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        const secretKey = credentials?.api_secret || process.env.STRIPE_SECRET_KEY || ''

        if (!secretKey) {
            return { success: false, error: 'Stripe Secret Key no configurada' }
        }

        // En prod: crear PaymentIntent o Checkout Session via API de Stripe
        // const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        //   method: 'POST', headers: { Authorization: `Bearer ${secretKey}` }, body: ...
        // })
        return {
            success: true,
            paymentUrl: `https://checkout.stripe.com/c/pay/demo_${request.orderId}`,
            transactionId: `STR-${request.orderId}`
        }
    }

    // ── NEQUI (Colombia · Pagos móviles) ──────────────────────────────────────
    private async handleNequi(request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        const phoneNumber = credentials?.phone_number || ''
        const clientId = credentials?.api_key || process.env.NEQUI_CLIENT_ID || ''

        if (!clientId) {
            return { success: false, error: 'Nequi Client ID no configurado' }
        }

        // Nequi admite dos flujos:
        // 1. Push: el cliente recibe notificación en su app → acepta pago
        // 2. QR: se genera un código QR para que el cliente escanee
        // Aquí simulamos el flujo QR (más común en restaurantes)
        return {
            success: true,
            qrCode: `nequi://pay?phone=${encodeURIComponent(phoneNumber)}&amount=${request.amount}&ref=${request.orderId}`,
            transactionId: `NEQ-${request.orderId}`
        }
    }

    // ── TARJETA / DATÁFONO (Local, sin integración) ────────────────────────────
    private async handleCardTerminal(request: PaymentRequest): Promise<PaymentResponse> {
        // Este método no requiere integración API.
        // El cajero procesa la tarjeta físicamente y confirma en el POS.
        return {
            success: true,
            transactionId: `CARD-${Date.now()}-${request.orderId.slice(-4)}`
        }
    }

    // ── TRANSFERENCIA BANCARIA ─────────────────────────────────────────────────
    private async handleBankTransfer(request: PaymentRequest, credentials?: Record<string, string>): Promise<PaymentResponse> {
        return {
            success: true,
            bankDetails: {
                bank: credentials?.['bank'] || 'Bancolombia',
                accountNumber: credentials?.account_id || '000-000000-00',
                accountType: credentials?.['account_type'] || 'Ahorros',
                holderName: 'Jamali OS Restaurant',
                reference: `REF-${request.orderId}`,
            },
            transactionId: `TRF-${request.orderId}`
        }
    }

    /**
     * Obtiene la lista de gateways habilitadas para un restaurante
     * desde su configuración en la tabla settings
     */
    getEnabledGateways(settings: Record<string, any>): PaymentGateway[] {
        return Object.entries(settings)
            .filter(([, cfg]) => cfg?.enabled === true)
            .map(([id]) => id as PaymentGateway)
    }
}

export const payments = new PaymentAdapter()
