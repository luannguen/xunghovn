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
    first: 'Hai', // Miền Nam con đầu gọi là Anh Hai / Chị Hai
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

// MA TRẬN HƠN 50 LUẬT RÚT GỌN CHUỖI QUAN HỆ (Pattern Engine Reducer)
const REDUCE_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // 1. Quan hệ Con Cái & Bạn Đời Ngược
  { pattern: /(^|\.)(son|daughter)\.father$/, replacement: '$1root' }, // Bố của con tôi -> Tôi
  { pattern: /(^|\.)(son|daughter)\.mother$/, replacement: '$1wife' }, // Mẹ của con tôi -> Vợ tôi
  { pattern: /(^|\.)wife\.husband$/, replacement: '$1root' },          // Chồng của Vợ tôi -> Tôi
  { pattern: /(^|\.)husband\.wife$/, replacement: '$1root' },          // Vợ của Chồng tôi -> Tôi
  { pattern: /(^|\.)wife\.son$/, replacement: '$1son' },               // Con trai của Vợ -> Con trai
  { pattern: /(^|\.)wife\.daughter$/, replacement: '$1daughter' },     // Con gái của Vợ -> Con gái
  { pattern: /(^|\.)husband\.son$/, replacement: '$1son' },
  { pattern: /(^|\.)husband\.daughter$/, replacement: '$1daughter' },

  // 2. Anh/Chị/Em của Con Cái -> Con Cái
  { pattern: /(^|\.)(son|daughter)\.(brother_older|brother_younger)$/, replacement: '$1son' },
  { pattern: /(^|\.)(son|daughter)\.(sister_older|sister_younger)$/, replacement: '$1daughter' },

  // 3. Bên Vợ / Bên Chồng
  { pattern: /(^|\.)wife\.father\.wife$/, replacement: '$1wife.mother' },
  { pattern: /(^|\.)wife\.mother\.husband$/, replacement: '$1wife.father' },
  { pattern: /(^|\.)husband\.father\.wife$/, replacement: '$1husband.mother' },
  { pattern: /(^|\.)husband\.mother\.husband$/, replacement: '$1husband.father' },
  { pattern: /(^|\.)wife\.(brother_older|brother_younger|sister_older|sister_younger)\.father$/, replacement: '$1wife.father' },
  { pattern: /(^|\.)wife\.(brother_older|brother_younger|sister_older|sister_younger)\.mother$/, replacement: '$1wife.mother' },

  // 4. Vòng Lặp Ngược Họ Nội
  { pattern: /(^|\.)father\.(brother_older|brother_younger|sister_older|sister_younger)\.father$/, replacement: '$1father.father' },
  { pattern: /(^|\.)father\.(brother_older|brother_younger|sister_older|sister_younger)\.mother$/, replacement: '$1father.mother' },

  // 5. Vòng Lặp Ngược Họ Ngoại
  { pattern: /(^|\.)mother\.(brother_older|brother_younger|sister_older|sister_younger)\.father$/, replacement: '$1mother.father' },
  { pattern: /(^|\.)mother\.(brother_older|brother_younger|sister_older|sister_younger)\.mother$/, replacement: '$1mother.mother' },

  // 6. Bố Mẹ của Anh/Chị/Em Ruột -> Bố Mẹ
  { pattern: /(^|\.)(brother_older|brother_younger|sister_older|sister_younger)\.father$/, replacement: '$1father' },
  { pattern: /(^|\.)(brother_older|brother_younger|sister_older|sister_younger)\.mother$/, replacement: '$1mother' },

  // 7. Anh/Chị/Em của Anh/Chị/Em -> Anh/Chị/Em
  { pattern: /(^|\.)(brother_older|brother_younger)\.(brother_older|brother_younger)$/, replacement: '$1brother_older' },
  { pattern: /(^|\.)(sister_older|sister_younger)\.(sister_older|sister_younger)$/, replacement: '$1sister_older' },
];

export function reduceKinshipChain(chain: string): string {
  if (!chain) return '';

  let current = chain;
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const rule of REDUCE_PATTERNS) {
      if (rule.pattern.test(current)) {
        current = current.replace(rule.pattern, rule.replacement);
        changed = true;
      }
    }
  }

  return current.replace(/^\.+|\.+$/g, '').replace(/\.{2,}/g, '.');
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

// Hàm kiểm tra quan hệ bị Redundant (Vòng lặp tự thân / Tái tạo ô trùng)
export function isRelationRedundant(
  nodeRelation: string,
  nodeChain: string,
  targetRelation: RelationType,
  allTreeRelations: string[] = []
): boolean {
  // 1. Khóa 'husband' trên ô Vợ ('wife'), và khóa 'wife' trên ô Chồng ('husband') -> Vì chính là Tôi (root)
  if (nodeRelation === 'wife' && targetRelation === 'husband') return true;
  if (nodeRelation === 'husband' && targetRelation === 'wife') return true;

  // 2. Khóa 'father' và 'mother' trên các con của 'root' ('son', 'daughter')
  if ((nodeChain === 'son' || nodeChain === 'daughter') && targetRelation === 'father') {
    return true; // Bố của con tôi chính là Tôi
  }
  if ((nodeChain === 'son' || nodeChain === 'daughter') && targetRelation === 'mother') {
    if (allTreeRelations.includes('wife')) return true; // Mẹ của con tôi chính là Vợ tôi (nếu Vợ đã có)
  }

  // 3. Khóa 'father' và 'mother' trên Anh/Chị/Em ruột của Tôi nếu Bố/Mẹ đã có trên cây
  if (nodeRelation.startsWith('brother') || nodeRelation.startsWith('sister')) {
    if (targetRelation === 'father' && allTreeRelations.includes('father')) return true;
    if (targetRelation === 'mother' && allTreeRelations.includes('mother')) return true;
  }

  return false;
}

// Kiểm tra danh sách quan hệ hợp lệ
export function getAvailableRelations(
  nodeGender: Gender,
  existingChildrenRelations: RelationType[],
  parentGender?: Gender,
  nodeRelation: string = 'root',
  nodeChain: string = '',
  allTreeRelations: string[] = []
): { allowed: RelationType[], warnings: Partial<Record<RelationType, string>> } {
  const allRels = Object.keys(GENDER_MAP).filter(k => k !== 'root') as RelationType[];
  const warnings: Partial<Record<RelationType, string>> = {};

  const allowed = allRels.filter(rel => {
    // 0. Khóa tuyệt đối các quan hệ Redundant (Chồng của Vợ, Bố của Con gái...)
    if (isRelationRedundant(nodeRelation, nodeChain, rel, allTreeRelations)) {
      return false;
    }

    // 1. Quy tắc Độc bản: Tối đa 1 Bố, 1 Mẹ trực tiếp
    if ((rel === 'father' || rel === 'mother') && existingChildrenRelations.includes(rel)) {
      return false;
    }

    // 2. Chống lặp ngược: Nếu node con sinh ra từ Bố (MALE), cấm thêm 'father'
    if (rel === 'father' && parentGender === 'MALE') {
      return false;
    }
    // Nếu node con sinh ra từ Mẹ (FEMALE), cấm thêm 'mother'
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

  if (termObj) {
    if (region === 'NORTH' && termObj.north) label = termObj.north;
    else if (region === 'CENTRAL' && termObj.central) label = termObj.central;
    else if (region === 'SOUTH' && termObj.south) label = termObj.south;
  }

  if (!isOrdinalAllowed(relation)) {
    return label;
  }

  const ordinalText = ORDINAL_MAP[region][ordinal];
  if (ordinalText) {
    return `${label} ${ordinalText}`;
  }

  return label;
}
