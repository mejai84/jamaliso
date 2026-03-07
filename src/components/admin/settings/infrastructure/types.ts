export interface SystemHealth {
    database: "online" | "offline"
    latency: number
    storage: string
    lastBackup: string
    version: string
}
