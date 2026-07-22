import { RelationType } from '@/hooks/useKinshipTree';

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type Region = 'ALL' | 'NORTH' | 'CENTRAL' | 'SOUTH';

export type Ordinal = 
  | 'none' 
  | 'first' 
  | 'second' 
  | 'third' 
  | 'fourth' 
  | 'fifth' 
  | 'sixth' 
  | 'seventh' 
  | 'eighth' 
  | 'ninth' 
  | 'youngest';

export type AgeOffset = 'older' | 'younger' | 'same';

// Các vai vế ĐỘC BẢN KHÔNG DÙNG THỨ BẬC (Bố, Mẹ, Vợ, Chồng, Tôi)
export function isOrdinalAllowed(relation: RelationType | 'root'): boolean {
  if (relation === 'root' || relation === 'father' || relation === 'mother' || relation === 'husband' || relation === 'wife') {
    return false;
  }
  return true;
}

// Nhãn Thứ bậc theo từng Vùng miền
export const ORDINAL_MAP: Record<Region, Record<Ordinal, string>> = {
  ALL: {
    none: '',
    first: 'Cả / Hai',
    second: 'Ba',
    third: 'Tư',
    fourth: 'Năm',
    fifth: 'Sáu',
    sixth: 'Bảy',
    seventh: 'Tám',
    eighth: 'Chín',
    ninth: 'Mười',
    youngest: 'Út',
  },
  NORTH: {
    none: '',
    first: 'Cả',
    second: 'Hai',
    third: 'Ba',
    fourth: 'Tư',
    fifth: 'Năm',
    sixth: 'Sáu',
    seventh: 'Bảy',
    eighth: 'Tám',
    ninth: 'Chín',
    youngest: 'Út',
  },
  SOUTH: {
    none: '',
    first: 'Hai', // Miền Nam con đầu là Anh Hai / Chị Hai
    second: 'Ba',
    third: 'Tư',
    fourth: 'Năm',
    fifth: 'Sáu',
    sixth: 'Bảy',
    seventh: 'Tám',
    eighth: 'Chín',
    ninth: 'Mười',
    youngest: 'Út',
  },
  CENTRAL: {
    none: '',
    first: 'Hai',
    second: 'Ba',
    third: 'Tư',
    fourth: 'Năm',
    fifth: 'Sáu',
    sixth: 'Bảy',
    seventh: 'Tám',
    eighth: 'Chín',
    ninth: 'Mười',
    youngest: 'Út',
  }
};

// Bản đồ Giới tính
export const GENDER_MAP: Record<RelationType | 'root', Gender> = {
  root: 'UNKNOWN',
  father: 'MALE',
  mother: 'FEMALE',
  husband: 'MALE',
  wife: 'FEMALE',
  son: 'MALE',
  daughter: 'FEMALE',
  brother_older: 'MALE',
  brother_younger: 'MALE',
  sister_older: 'FEMALE',
  sister_younger: 'FEMALE',
};

// Trọng số thế hệ
export const GENERATION_OFFSET: Record<RelationType | 'root', number> = {
  root: 0,
  father: -1,
  mother: -1,
  husband: 0,
  wife: 0,
  brother_older: 0,
  brother_younger: 0,
  sister_older: 0,
  sister_younger: 0,
  son: 1,
  daughter: 1,
};

// Rút gọn các chuỗi quan hệ phức tạp & vòng lặp ngược
export function reduceKinshipChain(chain: string): string {
  if (!chain) return '';
  
  let parts = chain.split('.');

  // Đệ quy áp dụng các luật thu gọn chuỗi
  let changed = true;
  while (changed) {
    changed = false;
    const len = parts.length;
    if (len < 2) break;

    const lastTwo = parts.slice(len - 2).join('.');
    const lastThree = len >= 3 ? parts.slice(len - 3).join('.') : '';

    // 1. Mẹ của Bố vợ / Vợ của Bố vợ -> Mẹ vợ
    if (lastTwo === 'father.wife' && parts[len - 3] === 'wife') {
      parts.splice(len - 2, 2, 'mother');
      changed = true;
    }
    // 2. Mẹ của Bác / Cô / Chú bên Nội -> Mẹ của Bố (Bà nội)
    else if ((parts[len - 2].startsWith('brother') || parts[len - 2].startsWith('sister')) && parts[len - 3] === 'father' && parts[len - 1] === 'mother') {
      parts = parts.slice(0, len - 2);
      parts.push('mother'); // father.mother
      changed = true;
    }
    // 3. Bố của Bác / Cô / Chú bên Nội -> Bố của Bố (Ông nội)
    else if ((parts[len - 2].startsWith('brother') || parts[len - 2].startsWith('sister')) && parts[len - 3] === 'father' && parts[len - 1] === 'father') {
      parts = parts.slice(0, len - 2);
      parts.push('father'); // father.father
      changed = true;
    }
    // 4. Mẹ của Cậu / Dì bên Ngoại -> Mẹ của Mẹ (Bà ngoại)
    else if ((parts[len - 2].startsWith('brother') || parts[len - 2].startsWith('sister')) && parts[len - 3] === 'mother' && parts[len - 1] === 'mother') {
      parts = parts.slice(0, len - 2);
      parts.push('mother'); // mother.mother
      changed = true;
    }
    // 5. Bố của Anh/Chị/Em -> Bố
    else if ((parts[len - 2].startsWith('brother') || parts[len - 2].startsWith('sister')) && parts[len - 1] === 'father') {
      parts.splice(len - 2, 2, 'father');
      changed = true;
    }
    // 6. Mẹ của Anh/Chị/Em -> Mẹ
    else if ((parts[len - 2].startsWith('brother') || parts[len - 2].startsWith('sister')) && parts[len - 1] === 'mother') {
      parts.splice(len - 2, 2, 'mother');
      changed = true;
    }
  }

  return parts.join('.');
}

// Động cơ Suy luận Quan hệ Đồng đương
export function resolveEquivalentRelation(
  parentRelation: string,
  newRelation: RelationType,
  ageOffset: AgeOffset = 'older'
): RelationType {
  // Con trai của Bố/Mẹ -> Anh trai hoặc Em trai của Tôi
  if ((parentRelation === 'father' || parentRelation === 'mother') && newRelation === 'son') {
    return ageOffset === 'younger' ? 'brother_younger' : 'brother_older';
  }
  
  // Con gái của Bố/Mẹ -> Chị gái hoặc Em gái của Tôi
  if ((parentRelation === 'father' || parentRelation === 'mother') && newRelation === 'daughter') {
    return ageOffset === 'younger' ? 'sister_younger' : 'sister_older';
  }

  return newRelation;
}

// Kiểm tra danh sách quan hệ hợp lệ và chống trùng lặp lặp ngược
export function getAvailableRelations(
  nodeGender: Gender, 
  existingChildrenRelations: RelationType[],
  parentGender?: Gender
): { allowed: RelationType[], warnings: Partial<Record<RelationType, string>> } {
  const allRels = Object.keys(GENDER_MAP).filter(k => k !== 'root') as RelationType[];
  const warnings: Partial<Record<RelationType, string>> = {};
  
  const allowed = allRels.filter(rel => {
    // 1. Quy tắc Độc bản: Chỉ có tối đa 1 Bố, 1 Mẹ trực tiếp
    if ((rel === 'father' || rel === 'mother') && existingChildrenRelations.includes(rel)) {
      return false;
    }

    // 2. Chống lặp ngược: Nếu node này được sinh ra từ một người cha Nam (parentGender === 'MALE'), thì người cha đó ĐÃ TỒN TẠI. Cấm thêm 'father'
    if (rel === 'father' && parentGender === 'MALE') {
      return false;
    }
    // Nếu node này sinh ra từ người mẹ Nữ, cấm thêm 'mother'
    if (rel === 'mother' && parentGender === 'FEMALE') {
      return false;
    }

    // 3. Quy tắc Giới tính (Cảnh báo LGBT)
    if (nodeGender === 'MALE' && rel === 'husband') {
      warnings[rel] = 'LGBT';
    }
    if (nodeGender === 'FEMALE' && rel === 'wife') {
      warnings[rel] = 'LGBT';
    }

    return true;
  });

  return { allowed, warnings };
}

// Định dạng danh xưng theo Vùng Miền + Thứ Bậc
export function formatRegionalLabel(
  baseLabel: string, 
  ordinal: Ordinal = 'none', 
  region: Region = 'ALL',
  termObj: any = null,
  relation: RelationType | 'root' = 'root'
): string {
  let label = baseLabel;
  
  // Lấy từ DB theo miền
  if (termObj) {
    if (region === 'NORTH' && termObj.north) label = termObj.north;
    else if (region === 'CENTRAL' && termObj.central) label = termObj.central;
    else if (region === 'SOUTH' && termObj.south) label = termObj.south;
  }

  // Nếu vai vế không dùng thứ bậc (Bố, Mẹ, Vợ, Chồng), KHÔNG ghép Thứ Bậc!
  if (!isOrdinalAllowed(relation)) {
    return label;
  }

  const ordinalText = ORDINAL_MAP[region][ordinal];
  if (ordinalText) {
    return `${label} ${ordinalText}`;
  }

  return label;
}
