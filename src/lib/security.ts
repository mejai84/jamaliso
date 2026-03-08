import { createClient } from './supabase/server'

/**
 * Validates that the current authenticated user belongs to the specified restaurant.
 * This is crucial for Server Actions that bypass RLS using direct PG pools.
 */
export async function validateUserRestaurant(targetRestaurantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized: No session found')
    }

    // Use a direct query or RPC to check user's profile restaurant_id
    // Profile RLS should allow user to select their own profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('restaurant_id, role')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        throw new Error('Unauthorized: Profile not found')
    }

    if (profile.restaurant_id !== targetRestaurantId) {
        // Special case for super_admins (optional, if needed in future)
        if (profile.role === 'super_admin') return { user, profile }

        throw new Error('Security Violation: User does not belong to this restaurant')
    }

    return { user, profile }
}

/**
 * Helper to get the current user and their restaurant context securely.
 */
export async function getSecurityContext() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id, role, full_name')
        .eq('id', user.id)
        .single()

    if (!profile) throw new Error('Unauthorized: Profile missing')

    return { user, profile }
}
