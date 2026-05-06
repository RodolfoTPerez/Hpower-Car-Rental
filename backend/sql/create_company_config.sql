-- ============================================
-- Tabla: company_config
-- Descripción: Configuración general de la compañía
-- ============================================

CREATE TABLE IF NOT EXISTS company_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por key
CREATE INDEX IF NOT EXISTS idx_company_config_key ON company_config(key);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_config_updated_at
    BEFORE UPDATE ON company_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuración inicial (logo por defecto desde bucket existente 'logos')
INSERT INTO company_config (key, value)
VALUES ('logo_url', 'https://xtvopaehirznzeyuanwc.supabase.co/storage/v1/object/public/logos/logo_hpower.png')
ON CONFLICT (key) DO NOTHING;

-- Política de seguridad (RLS)
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública (para que los HTMLs puedan leer el logo)
CREATE POLICY "Public read access for company_config"
    ON company_config FOR SELECT
    USING (true);

-- Permitir escritura solo a usuarios autenticados (admin)
CREATE POLICY "Authenticated write access for company_config"
    ON company_config FOR ALL
    USING (auth.role() = 'authenticated');

-- NOTA: El bucket 'logos' ya existe en Supabase
-- No es necesario crear un nuevo bucket de Storage
