export interface AuditLog {
    id: string
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    old_values: any
    new_values: any
    created_at: string
    profiles: {
        full_name: string
        email: string
    }
}

export interface StaffMember {
    id: string
    full_name: string
    email: string
}
