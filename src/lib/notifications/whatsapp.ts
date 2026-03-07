/**
 * WhatsApp Notification Service - JAMALI OS
 * Handles sending transactional messages (Orders, Reservations, Alerts)
 */

export type WhatsAppProvider = 'meta' | 'twilio' | 'simulation'

export interface WhatsAppConfig {
    provider: WhatsAppProvider
    apiKey?: string
    phoneNumberId?: string // Meta specifically
    accountSid?: string // Twilio specifically
    fromNumber: string
}

export interface WhatsAppMessage {
    to: string
    templateName?: string
    language?: string
    params?: string[]
    body?: string // For free-form messages (caution: may require pre-approved templates in Meta)
}

class WhatsAppService {
    private config: WhatsAppConfig = {
        provider: 'simulation',
        fromNumber: 'JAMALI_OS'
    }

    /**
     * Initialize the service with real credentials
     */
    configure(config: WhatsAppConfig) {
        this.config = config
    }

    /**
     * Main send function
     */
    async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; id?: string; error?: string }> {
        console.log(`[WhatsAppService] Sending message via ${this.config.provider}:`, message)

        if (this.config.provider === 'simulation') {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800))

            // Log for debugging in dev
            if (process.env.NODE_ENV === 'development') {
                console.table({
                    TO: message.to,
                    TEMPLATE: message.templateName || 'FREE_FORM',
                    PARAMS: message.params?.join(', ') || 'NONE',
                    PROVIDER: 'SIMULATION_MODE'
                })
            }

            return { success: true, id: `sim_${Math.random().toString(36).substr(2, 9)}` }
        }

        // TODO: Implement real Meta/Twilio logic here
        // const response = await fetch(...)

        return { success: false, error: 'Provider not yet implemented for production' }
    }

    /**
     * Helper: Send Order Confirmation
     */
    async sendOrderConfirmation(to: string, orderId: string, total: number) {
        return this.sendMessage({
            to,
            templateName: 'order_confirmation',
            params: [orderId, total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })]
        })
    }

    /**
     * Helper: Send Order Ready Alert
     */
    async sendOrderReady(to: string, orderId: string, tableLabel: string) {
        return this.sendMessage({
            to,
            templateName: 'order_ready',
            params: [orderId, tableLabel]
        })
    }

    /**
     * Helper: Send Reservation Confirmation
     */
    async sendReservationConfirmed(to: string, date: string, time: string, persons: number) {
        return this.sendMessage({
            to,
            templateName: 'reservation_confirmed',
            params: [date, time, persons.toString()]
        })
    }
}

export const whatsapp = new WhatsAppService()
