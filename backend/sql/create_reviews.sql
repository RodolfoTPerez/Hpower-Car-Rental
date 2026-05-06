-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
    FOR SELECT
    TO public, authenticated, anon
    USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Anyone can insert reviews" ON reviews
    FOR INSERT
    TO public, authenticated, anon
    WITH CHECK (true);

-- Create index for sorting by date
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
