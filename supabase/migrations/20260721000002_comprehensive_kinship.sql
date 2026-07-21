-- 20260721000002_comprehensive_kinship.sql
-- Bổ sung bộ dữ liệu gia phả toàn diện với các quy tắc rút gọn (Mẹ kế, Dượng, Cháu đích tôn, Cố...)

INSERT INTO public.kinship_rules (relation_chain, term_north, term_central, term_south, description) VALUES
-- Hàng Ngang (Vợ / Chồng / Anh / Chị / Em dâu rể)
('brother_older.wife', 'Chị dâu', 'Chị dâu', 'Chị dâu', 'Vợ của anh trai'),
('brother_younger.wife', 'Em dâu', 'Em dâu', 'Em dâu', 'Vợ của em trai'),
('sister_older.husband', 'Anh rể', 'Anh rể', 'Anh rể', 'Chồng của chị gái'),
('sister_younger.husband', 'Em rể', 'Em rể', 'Em rể', 'Chồng của em gái'),

-- Hàng Dọc (Bố Mẹ Kế)
('father.wife', 'Mẹ kế / Dì ghẻ', 'Mẹ kế', 'Mẹ kế', 'Vợ của bố (Không phải mẹ đẻ)'),
('mother.husband', 'Bố dượng', 'Dượng', 'Dượng', 'Chồng của mẹ (Không phải bố đẻ)'),

-- Thế Hệ -2 (Ông Bà)
-- Nội
('father.father.wife', 'Bà nội', 'Bà nội', 'Bà nội', 'Vợ của ông nội'),
('father.mother.husband', 'Ông nội', 'Ông nội', 'Ông nội', 'Chồng của bà nội'),
-- Ngoại
('mother.father.wife', 'Bà ngoại', 'Bà ngoại', 'Bà ngoại', 'Vợ của ông ngoại'),
('mother.mother.husband', 'Ông ngoại', 'Ông ngoại', 'Ông ngoại', 'Chồng của bà ngoại'),

-- Thế Hệ -3 (Cố / Cụ)
('father.father.father', 'Cụ nội ông', 'Cố nội', 'Cố nội', 'Bố của ông nội'),
('father.father.mother', 'Cụ nội bà', 'Cố nội', 'Cố nội', 'Mẹ của ông nội'),
('mother.father.father', 'Cụ ngoại ông', 'Cố ngoại', 'Cố ngoại', 'Bố của ông ngoại'),
('mother.father.mother', 'Cụ ngoại bà', 'Cố ngoại', 'Cố ngoại', 'Mẹ của ông ngoại'),

-- Thế hệ Cậu/Dì/Chú/Bác (Thế hệ -1) mở rộng
('father.brother_older.son', 'Anh họ (Bá)', 'Anh họ', 'Anh họ', 'Con trai của bác'),
('father.brother_older.daughter', 'Chị họ (Bá)', 'Chị họ', 'Chị họ', 'Con gái của bác'),
('father.brother_younger.son', 'Em họ (Thúc)', 'Em họ', 'Em họ', 'Con trai của chú'),
('father.brother_younger.daughter', 'Em họ (Thúc)', 'Em họ', 'Em họ', 'Con gái của chú'),
('father.sister.son', 'Anh/Em họ (Cô)', 'Anh/Em họ', 'Anh/Em họ', 'Con trai của cô'),
('father.sister.daughter', 'Chị/Em họ (Cô)', 'Chị/Em họ', 'Chị/Em họ', 'Con gái của cô'),

('mother.brother.son', 'Anh/Em họ (Cậu)', 'Anh/Em họ', 'Anh/Em họ', 'Con trai của cậu'),
('mother.brother.daughter', 'Chị/Em họ (Cậu)', 'Chị/Em họ', 'Chị/Em họ', 'Con gái của cậu'),
('mother.sister_older.son', 'Anh/Em họ (Dì)', 'Anh/Em họ', 'Anh/Em họ', 'Con trai của dì'),
('mother.sister_older.daughter', 'Chị/Em họ (Dì)', 'Chị/Em họ', 'Chị/Em họ', 'Con gái của dì'),
('mother.sister_younger.son', 'Anh/Em họ (Dì)', 'Anh/Em họ', 'Anh/Em họ', 'Con trai của dì'),
('mother.sister_younger.daughter', 'Chị/Em họ (Dì)', 'Chị/Em họ', 'Chị/Em họ', 'Con gái của dì'),

-- Thế hệ +2 (Cháu)
('son.wife', 'Con dâu', 'Con dâu', 'Con dâu', 'Vợ của con trai'),
('daughter.husband', 'Con rể', 'Con rể', 'Con rể', 'Chồng của con gái'),
('brother_older.son', 'Cháu trai', 'Cháu trai', 'Cháu trai', 'Con trai của anh trai'),
('brother_older.daughter', 'Cháu gái', 'Cháu gái', 'Cháu gái', 'Con gái của anh trai'),
('brother_younger.son', 'Cháu trai', 'Cháu trai', 'Cháu trai', 'Con trai của em trai'),
('brother_younger.daughter', 'Cháu gái', 'Cháu gái', 'Cháu gái', 'Con gái của em trai'),

-- Thế hệ +3 (Chắt)
('son.son.son', 'Chắt đích tôn', 'Chắt nội', 'Chắt nội', 'Con trai của cháu nội đích tôn'),
('son.son.daughter', 'Chắt nội', 'Chắt nội', 'Chắt nội', 'Con gái của cháu nội'),
('daughter.son.son', 'Chắt ngoại', 'Chắt ngoại', 'Chắt ngoại', 'Con trai của cháu ngoại')

ON CONFLICT (relation_chain) DO UPDATE SET 
    term_north = EXCLUDED.term_north, 
    term_central = EXCLUDED.term_central, 
    term_south = EXCLUDED.term_south, 
    description = EXCLUDED.description;
