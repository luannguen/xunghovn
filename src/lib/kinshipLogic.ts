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
    first: 'Hai', // Miền Nam không gọi là Cả, con đầu gọi là Anh Hai / Chị Hai
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

// Động cơ Suy luận Quan hệ Đồng đương (Equivalence Chain Reducer)
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

// Kiểm tra danh sách quan hệ hợp lệ
export function getAvailableRelations(
  nodeGender: Gender, 
  existingChildrenRelations: RelationType[]
): { allowed: RelationType[], warnings: Partial<Record<RelationType, string>> } {
  const allRels = Object.keys(GENDER_MAP).filter(k => k !== 'root') as RelationType[];
  const warnings: Partial<Record<RelationType, string>> = {};
  
  const allowed = allRels.filter(rel => {
    // Quy tắc Độc bản: Chỉ có tối đa 1 Bố, 1 Mẹ trực tiếp
    if ((rel === 'father' || rel === 'mother') && existingChildrenRelations.includes(rel)) {
      return false;
    }

    // Quy tắc Giới tính (Cảnh báo LGBT)
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
  termObj: any = null
): string {
  let label = baseLabel;
  
  // Nếu có dữ liệu từ DB theo miền
  if (termObj) {
    if (region === 'NORTH' && termObj.north) label = termObj.north;
    else if (region === 'CENTRAL' && termObj.central) label = termObj.central;
    else if (region === 'SOUTH' && termObj.south) label = termObj.south;
  }

  const ordinalText = ORDINAL_MAP[region][ordinal];
  if (ordinalText) {
    return `${label} ${ordinalText}`;
  }

  return label;
}
