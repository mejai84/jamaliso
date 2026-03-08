-- Create reservations table properly integrated with multi-tenant system
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    num_people INTEGER NOT NULL CHECK (num_people > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin and Staff full access for their restaurant
CREATE POLICY "Staff can manage reservations" ON public.reservations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.restaurant_id = reservations.restaurant_id
            AND profiles.role IN ('admin', 'staff', 'cashier', 'manager')
        )
    );

-- Anyone can create a reservation (public form) -> must provide restaurant_id
CREATE POLICY "Public can create reservations" ON public.reservations
    FOR INSERT WITH CHECK (true);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);

-- Notification Trigger
CREATE OR REPLACE FUNCTION notify_new_reservation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.security_audit (
        restaurant_id,
        event_type,
        severity,
        description,
        metadata
    ) VALUES (
        NEW.restaurant_id,
        'NEW_RESERVATION',
        'LOW',
        'Nueva reserva de ' || NEW.customer_name || ' para el ' || NEW.reservation_date || ' a las ' || NEW.reservation_time,
        jsonb_build_object(
            'reservation_id', NEW.id,
            'customer_name', NEW.customer_name,
            'num_people', NEW.num_people
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_notify_new_reservation
    AFTER INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE PROCEDURE notify_new_reservation();
