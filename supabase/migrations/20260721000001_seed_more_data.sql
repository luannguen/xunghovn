-- Bổ sung thêm các luật nhân xưng cơ bản (Ông, Bà, Cháu...)
INSERT INTO public.kinship_rules (relation_chain, term_north, term_central, term_south, description) VALUES
('father.father', 'Ông nội', 'Ông nội', 'Ông nội', 'Bố của bố'),
('father.mother', 'Bà nội', 'Bà nội', 'Bà nội', 'Mẹ của bố'),
('mother.father', 'Ông ngoại', 'Ông ngoại', 'Ông ngoại', 'Bố của mẹ'),
('mother.mother', 'Bà ngoại', 'Bà ngoại', 'Bà ngoại', 'Mẹ của mẹ'),
('husband', 'Chồng', 'Chồng', 'Chồng', 'Người kết hôn (Nam)'),
('wife', 'Vợ', 'Vợ', 'Vợ', 'Người kết hôn (Nữ)'),
('son', 'Con trai', 'Con trai', 'Con trai', 'Người được sinh ra (Nam)'),
('daughter', 'Con gái', 'Con gái', 'Con gái', 'Người được sinh ra (Nữ)'),
('brother_older', 'Anh trai', 'Anh trai', 'Anh', 'Người sinh trước (Nam)'),
('brother_younger', 'Em trai', 'Em trai', 'Em', 'Người sinh sau (Nam)'),
('sister_older', 'Chị gái', 'Chị gái', 'Chị', 'Người sinh trước (Nữ)'),
('sister_younger', 'Em gái', 'Em gái', 'Em', 'Người sinh sau (Nữ)'),
('son.son', 'Cháu nội đích tôn', 'Cháu nội', 'Cháu nội', 'Con trai của con trai'),
('son.daughter', 'Cháu nội', 'Cháu nội', 'Cháu nội', 'Con gái của con trai'),
('daughter.son', 'Cháu ngoại', 'Cháu ngoại', 'Cháu ngoại', 'Con trai của con gái'),
('daughter.daughter', 'Cháu ngoại', 'Cháu ngoại', 'Cháu ngoại', 'Con gái của con gái')
ON CONFLICT (relation_chain) DO UPDATE SET 
    term_north = EXCLUDED.term_north, 
    term_central = EXCLUDED.term_central, 
    term_south = EXCLUDED.term_south, 
    description = EXCLUDED.description;
