-- 00001_init_schema.sql
-- Create kinship_rules table to map relation chains to Vietnamese terms

CREATE TABLE public.kinship_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    relation_chain VARCHAR NOT NULL UNIQUE, -- e.g., 'father.brother_younger.wife'
    term_north VARCHAR NOT NULL,
    term_central VARCHAR,
    term_south VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.kinship_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on kinship_rules"
    ON public.kinship_rules
    FOR SELECT
    USING (true);

-- Allow authenticated users (admin) to insert/update/delete
CREATE POLICY "Allow authenticated full access on kinship_rules"
    ON public.kinship_rules
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert some initial seed data
INSERT INTO public.kinship_rules (relation_chain, term_north, term_central, term_south, description) VALUES
('father', 'Bố', 'Ba', 'Tía', 'Người sinh ra mình (Nam)'),
('mother', 'Mẹ', 'Mẹ', 'Má', 'Người sinh ra mình (Nữ)'),
('father.brother_older', 'Bác', 'Bác', 'Bác', 'Anh trai của bố'),
('father.brother_older.wife', 'Bác', 'Bác', 'Bác', 'Vợ của anh trai của bố'),
('father.brother_younger', 'Chú', 'Chú', 'Chú', 'Em trai của bố'),
('father.brother_younger.wife', 'Thím', 'Thím', 'Thím', 'Vợ của em trai của bố'),
('father.sister', 'Cô', 'Cô', 'Cô', 'Chị hoặc em gái của bố'),
('father.sister.husband', 'Chú', 'Chú', 'Dượng', 'Chồng của chị/em gái của bố'),
('mother.brother', 'Cậu', 'Cậu', 'Cậu', 'Anh hoặc em trai của mẹ'),
('mother.brother.wife', 'Mợ', 'Mợ', 'Mợ', 'Vợ của anh/em trai của mẹ'),
('mother.sister_older', 'Bác', 'Bác', 'Bác', 'Chị gái của mẹ'),
('mother.sister_younger', 'Dì', 'Dì', 'Dì', 'Em gái của mẹ'),
('mother.sister.husband', 'Dượng', 'Dượng', 'Dượng', 'Chồng của chị/em gái của mẹ');
