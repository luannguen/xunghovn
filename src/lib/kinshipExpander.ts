import { RelationType } from '@/hooks/useKinshipTree';
import { Ordinal, AgeOffset } from './kinshipLogic';

export interface KinshipPathStep {
  relation: RelationType;
  ageOffset?: AgeOffset;
  ordinal?: Ordinal;
}

export interface KinshipPreset {
  id: string;
  name: string;
  category: 'NOI' | 'NGOAI' | 'VO_CHONG' | 'CON_CHAU' | 'HO_HANG';
  description: string;
  steps: KinshipPathStep[];
}

export const KINSHIP_PRESETS: KinshipPreset[] = [
  // HỌ NỘI
  { id: 'bac_noi', name: 'Bác (Anh trai của Bố)', category: 'NOI', description: 'Anh trai của Bố ruột', steps: [{ relation: 'father' }, { relation: 'brother_older' }] },
  { id: 'chu_noi', name: 'Chú (Em trai của Bố)', category: 'NOI', description: 'Em trai của Bố ruột', steps: [{ relation: 'father' }, { relation: 'brother_younger' }] },
  { id: 'co_noi', name: 'Cô / O (Chị/Em gái của Bố)', category: 'NOI', description: 'Chị hoặc Em gái của Bố ruột', steps: [{ relation: 'father' }, { relation: 'sister_younger' }] },
  { id: 'ong_noi', name: 'Ông Nội (Bố của Bố)', category: 'NOI', description: 'Bố của Bố ruột', steps: [{ relation: 'father' }, { relation: 'father' }] },
  { id: 'ba_noi', name: 'Bà Nội (Mẹ của Bố)', category: 'NOI', description: 'Mẹ của Bố ruột', steps: [{ relation: 'father' }, { relation: 'mother' }] },
  { id: 'ong_co_noi', name: 'Ông Cố Nội (Bố của Ông Nội)', category: 'NOI', description: 'Bố của Ông Nội (Thế hệ 4)', steps: [{ relation: 'father' }, { relation: 'father' }, { relation: 'father' }] },
  { id: 'ba_co_noi', name: 'Bà Cố Nội (Mẹ của Ông Nội)', category: 'NOI', description: 'Mẹ của Ông Nội (Thế hệ 4)', steps: [{ relation: 'father' }, { relation: 'father' }, { relation: 'mother' }] },
  { id: 'thim_noi', name: 'Thím (Vợ của Chú)', category: 'NOI', description: 'Vợ của em trai Bố', steps: [{ relation: 'father' }, { relation: 'brother_younger' }, { relation: 'wife' }] },
  { id: 'bac_gai_noi', name: 'Bác Gái (Vợ của Bác)', category: 'NOI', description: 'Vợ của anh trai Bố', steps: [{ relation: 'father' }, { relation: 'brother_older' }, { relation: 'wife' }] },
  { id: 'duong_noi', name: 'Dượng (Chồng của Cô)', category: 'NOI', description: 'Chồng của chị/em gái Bố', steps: [{ relation: 'father' }, { relation: 'sister_younger' }, { relation: 'husband' }] },
  { id: 'con_bac_noi', name: 'Anh/Chị Họ Nội (Con của Bác)', category: 'NOI', description: 'Con của anh trai Bố', steps: [{ relation: 'father' }, { relation: 'brother_older' }, { relation: 'son' }] },
  { id: 'con_chu_noi', name: 'Em Họ Nội (Con của Chú)', category: 'NOI', description: 'Con của em trai Bố', steps: [{ relation: 'father' }, { relation: 'brother_younger' }, { relation: 'son' }] },

  // HỌ NGOẠI
  { id: 'cau_ngoai', name: 'Cậu (Anh/Em trai của Mẹ)', category: 'NGOAI', description: 'Anh hoặc em trai của Mẹ', steps: [{ relation: 'mother' }, { relation: 'brother_younger' }] },
  { id: 'di_ngoai', name: 'Dì (Em gái của Mẹ)', category: 'NGOAI', description: 'Em gái của Mẹ ruột', steps: [{ relation: 'mother' }, { relation: 'sister_younger' }] },
  { id: 'bac_ngoai', name: 'Bác Ngoại (Anh/Chị của Mẹ)', category: 'NGOAI', description: 'Anh hoặc chị gái của Mẹ', steps: [{ relation: 'mother' }, { relation: 'brother_older' }] },
  { id: 'ong_ngoai', name: 'Ông Ngoại (Bố của Mẹ)', category: 'NGOAI', description: 'Bố của Mẹ ruột', steps: [{ relation: 'mother' }, { relation: 'father' }] },
  { id: 'ba_ngoai', name: 'Bà Ngoại (Mẹ của Mẹ)', category: 'NGOAI', description: 'Mẹ của Mẹ ruột', steps: [{ relation: 'mother' }, { relation: 'mother' }] },
  { id: 'ong_co_ngoai', name: 'Ông Cố Ngoại (Bố của Ông Ngoại)', category: 'NGOAI', description: 'Bố của Ông Ngoại', steps: [{ relation: 'mother' }, { relation: 'father' }, { relation: 'father' }] },
  { id: 'ba_co_ngoai', name: 'Bà Cố Ngoại (Mẹ của Ông Ngoại)', category: 'NGOAI', description: 'Mẹ của Ông Ngoại', steps: [{ relation: 'mother' }, { relation: 'father' }, { relation: 'mother' }] },
  { id: 'mo_ngoai', name: 'Mợ (Vợ của Cậu)', category: 'NGOAI', description: 'Vợ của anh/em trai Mẹ', steps: [{ relation: 'mother' }, { relation: 'brother_younger' }, { relation: 'wife' }] },
  { id: 'duong_ngoai', name: 'Dượng (Chồng của Dì)', category: 'NGOAI', description: 'Chồng của em gái Mẹ', steps: [{ relation: 'mother' }, { relation: 'sister_younger' }, { relation: 'husband' }] },
  { id: 'con_cau_ngoai', name: 'Anh/Em Họ Ngoại (Con của Cậu)', category: 'NGOAI', description: 'Con của cậu', steps: [{ relation: 'mother' }, { relation: 'brother_younger' }, { relation: 'son' }] },
  { id: 'con_di_ngoai', name: 'Anh/Em Họ Ngoại (Con của Dì)', category: 'NGOAI', description: 'Con của dì', steps: [{ relation: 'mother' }, { relation: 'sister_younger' }, { relation: 'son' }] },

  // BÊN VỢ / CHỒNG & DÂU RỂ
  { id: 'bo_vo', name: 'Bố Vợ (Ba Vợ)', category: 'VO_CHONG', description: 'Bố của vợ', steps: [{ relation: 'wife' }, { relation: 'father' }] },
  { id: 'me_vo', name: 'Mẹ Vợ (Má Vợ)', category: 'VO_CHONG', description: 'Mẹ của vợ', steps: [{ relation: 'wife' }, { relation: 'mother' }] },
  { id: 'anh_dau', name: 'Chị Dâu (Vợ của Anh trai)', category: 'VO_CHONG', description: 'Vợ của anh trai', steps: [{ relation: 'brother_older' }, { relation: 'wife' }] },
  { id: 'em_dau', name: 'Em Dâu (Vợ của Em trai)', category: 'VO_CHONG', description: 'Vợ của em trai', steps: [{ relation: 'brother_younger' }, { relation: 'wife' }] },
  { id: 'anh_re', name: 'Anh Rể (Chồng của Chị gái)', category: 'VO_CHONG', description: 'Chồng của chị gái', steps: [{ relation: 'sister_older' }, { relation: 'husband' }] },
  { id: 'em_re', name: 'Em Rể (Chồng của Em gái)', category: 'VO_CHONG', description: 'Chồng của em gái', steps: [{ relation: 'sister_younger' }, { relation: 'husband' }] },
  { id: 'thong_gia', name: 'Thông Gia (Bố Vợ của Con trai)', category: 'VO_CHONG', description: 'Bố của vợ con trai', steps: [{ relation: 'son' }, { relation: 'wife' }, { relation: 'father' }] },

  // HÀNG CON CHÁU
  { id: 'chau_noi', name: 'Cháu Nội (Con của Con trai)', category: 'CON_CHAU', description: 'Con của con trai', steps: [{ relation: 'son' }, { relation: 'son' }] },
  { id: 'chau_ngoai', name: 'Cháu Ngoại (Con của Con gái)', category: 'CON_CHAU', description: 'Con của con gái', steps: [{ relation: 'daughter' }, { relation: 'son' }] },
  { id: 'chat_noi', name: 'Chắt Nội (Con của Cháu nội)', category: 'CON_CHAU', description: 'Con của cháu nội (Thế hệ 4)', steps: [{ relation: 'son' }, { relation: 'son' }, { relation: 'son' }] },
  { id: 'chat_ngoai', name: 'Chắt Ngoại (Con của Cháu ngoại)', category: 'CON_CHAU', description: 'Con của cháu ngoại (Thế hệ 4)', steps: [{ relation: 'daughter' }, { relation: 'son' }, { relation: 'son' }] },
  { id: 'con_dau', name: 'Con Dâu (Vợ của Con trai)', category: 'CON_CHAU', description: 'Vợ của con trai', steps: [{ relation: 'son' }, { relation: 'wife' }] },
  { id: 'con_re', name: 'Con Rể (Chồng của Con gái)', category: 'CON_CHAU', description: 'Chồng của con gái', steps: [{ relation: 'daughter' }, { relation: 'husband' }] },
];
