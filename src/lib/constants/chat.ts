export type AreaType = 'waiter' | 'kitchen' | 'cashier' | 'admin' | 'bar' | 'all'
export type MessageType = 'text' | 'alert' | 'info' | 'urgent'

export const AREA_LABELS: Record<AreaType, { label: string; emoji: string; color: string }> = {
    waiter: { label: 'Mesero', emoji: '🏃', color: '#f97316' },
    kitchen: { label: 'Cocina', emoji: '👨‍🍳', color: '#ef4444' },
    cashier: { label: 'Caja', emoji: '💰', color: '#22c55e' },
    admin: { label: 'Admin', emoji: '📋', color: '#6366f1' },
    bar: { label: 'Bar', emoji: '🍹', color: '#a855f7' },
    all: { label: 'Todos', emoji: '📢', color: '#64748b' },
}
