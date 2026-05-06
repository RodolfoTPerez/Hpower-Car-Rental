-- Tabla para tracking de visitas al sitio web
CREATE TABLE IF NOT EXISTS analytics_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    page_title TEXT,
    screen_resolution TEXT,
    language TEXT,
    country TEXT,
    city TEXT,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_analytics_visits_session_start ON analytics_visits(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_country ON analytics_visits(country);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_page_url ON analytics_visits(page_url);

-- Habilitar RLS (Row Level Security)
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;

-- Política para permitir insert desde cualquier usuario (anon)
CREATE POLICY "Allow insert for all users" ON analytics_visits
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Política para permitir select a usuarios autenticados (admin)
CREATE POLICY "Allow select for authenticated users" ON analytics_visits
    FOR SELECT
    TO authenticated
    USING (true);
