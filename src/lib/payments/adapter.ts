/**
 * Unified Payment Adapter - JAMALI OS
 * Supports multiple gateways based on restaurant region/config
 */

export type PaymentGateway = 'wompi' | 'mercadopago' | 'stripe' | 'redsys' | 'manual'

export interface PaymentRequest {
    amount: number
    currency: string
    orderId: string
    customerEmail: string
    description: string
    restaurantId: string
}

export interface PaymentResponse {
    success: boolean
    paymentUrl?: string
    transactionId?: string
    error?: string
}

class PaymentAdapter {
    /**
     * Generates a payment link or processes the transaction
     */
    async createPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
        console.log(`[PaymentAdapter] Creating ${gateway} payment for order ${request.orderId}`)

        switch (gateway) {
            case 'wompi':
                return this.handleWompi(request)
            case 'mercadopago':
                return this.handleMercadoPago(request)
            case 'stripe':
                return this.handleStripe(request)
            default:
                return { success: false, error: 'Gateway not supported yet' }
        }
    }

    private async handleWompi(request: PaymentRequest): Promise<PaymentResponse> {
        // Integration with existing wompi.ts logic or direct API
        return { success: true, paymentUrl: `https://checkout.wompi.co/p/?id=${request.orderId}` }
    }

    private async handleMercadoPago(request: PaymentRequest): Promise<PaymentResponse> {
        // Placeholder for MercadoPago (Mexico/Chile/Peru)
        return { success: true, paymentUrl: `https://mercadopago.com/checkout/${request.orderId}` }
    }

    private async handleStripe(request: PaymentRequest): Promise<PaymentResponse> {
        // Placeholder for Stripe (Spain/Europe)
        return { success: true, paymentUrl: `https://checkout.stripe.com/pay/${request.orderId}` }
    }
}

export const payments = new PaymentAdapter()
