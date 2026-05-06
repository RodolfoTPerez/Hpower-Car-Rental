-- Tabla para tracking de emails
CREATE TABLE IF NOT EXISTS public.email_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id text UNIQUE NOT NULL, -- ID único del email (generado por nosotros)
  to_email text NOT NULL,
  subject text NOT NULL,
  status text DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, spam
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  bounced_at timestamp with time zone,
  bounce_reason text,
  metadata jsonb DEFAULT '{}' -- Datos adicionales (nombre, sucursal, etc.)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON public.email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_email_id ON public.email_tracking(email_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_to_email ON public.email_tracking(to_email);

-- Agregar campo sendgrid_api_key a email_config
ALTER TABLE public.email_config 
ADD COLUMN IF NOT EXISTS sendgrid_api_key text,
ADD COLUMN IF NOT EXISTS use_sendgrid boolean DEFAULT false;
