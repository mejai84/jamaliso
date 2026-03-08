-- 🌐 ACTIVACIÓN DE CENTRAL DE VENTAS ONLINE
-- Agrega campos necesarios para controlar la presencia web de cada restaurante

ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_web_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS web_mode text DEFAULT 'menu' CHECK (web_mode IN ('menu', 'ecommerce')),
ADD COLUMN IF NOT EXISTS allow_pickup boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_delivery boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS tiktok_url text,
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS pinterest_url text,
ADD COLUMN IF NOT EXISTS cuisine_type text,
ADD COLUMN IF NOT EXISTS custom_seo_title text,
ADD COLUMN IF NOT EXISTS custom_seo_description text,
ADD COLUMN IF NOT EXISTS whatsapp_float_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_custom_message text,
ADD COLUMN IF NOT EXISTS promo_banner_text text,
ADD COLUMN IF NOT EXISTS promo_banner_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS address_text text,
ADD COLUMN IF NOT EXISTS google_maps_link text,
ADD COLUMN IF NOT EXISTS online_hours_config jsonb DEFAULT '{}'::jsonb;

-- Comentarios informativos
COMMENT ON COLUMN public.restaurants.is_web_active IS 'Indica si la página web pública está activa.';
COMMENT ON COLUMN public.restaurants.web_mode IS 'Define si es solo menú digital o híbrido (ecommerce).';
COMMENT ON COLUMN public.restaurants.whatsapp_float_enabled IS 'Habilita el botón flotante de WhatsApp en la web pública.';
COMMENT ON COLUMN public.restaurants.promo_banner_text IS 'Texto del anuncio o promoción que aparece en la parte superior de la web.';
