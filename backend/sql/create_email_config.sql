-- Tabla para configuración de email
CREATE TABLE IF NOT EXISTS public.email_config (
  id integer PRIMARY KEY DEFAULT 1,
  smtp_host text DEFAULT 'smtp.gmail.com',
  smtp_port integer DEFAULT 587,
  smtp_user text,
  smtp_pass text,
  email_from text,
  email_to text DEFAULT 'info@hpower.com',
  active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insertar configuración por defecto (vacía)
INSERT INTO public.email_config (id, smtp_host, smtp_port, smtp_user, smtp_pass, email_from, email_to, active)
VALUES (1, 'smtp.gmail.com', 587, '', '', '', 'info@hpower.com', true)
ON CONFLICT (id) DO NOTHING;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_config_active ON public.email_config(active);
