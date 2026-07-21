import { RelationType } from '@/hooks/useKinshipTree';

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

// Bản đồ Giới tính của từng loại quan hệ
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

// Trọng số thế hệ: Bố mẹ (-1, lùi về trước), Con cái (+1, thế hệ sau), Anh chị em (0, ngang hàng)
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

// Hàm kiểm tra các nút được phép thêm dựa trên ràng buộc
export function getAvailableRelations(
  nodeGender: Gender, 
  existingChildrenRelations: RelationType[]
): { allowed: RelationType[], warnings: Partial<Record<RelationType, string>> } {
  const allRels = Object.keys(GENDER_MAP).filter(k => k !== 'root') as RelationType[];
  const warnings: Partial<Record<RelationType, string>> = {};
  
  const allowed = allRels.filter(rel => {
    // 1. Quy tắc Độc bản: Mỗi người chỉ có tối đa 1 Bố ruột, 1 Mẹ ruột
    if ((rel === 'father' || rel === 'mother') && existingChildrenRelations.includes(rel)) {
      return false; // Ẩn luôn nút Bố/Mẹ nếu đã thêm
    }

    // 2. Quy tắc Giới tính Truyền thống (Cảnh báo LGBT)
    if (nodeGender === 'MALE' && rel === 'husband') {
      warnings[rel] = 'LGBT';
    }
    if (nodeGender === 'FEMALE' && rel === 'wife') {
      warnings[rel] = 'LGBT';
    }

    return true; // Vẫn cho phép hiện trong mảng allowed, nhưng UI sẽ check warnings để hiện Modal
  });

  return { allowed, warnings };
}

// Hàm rút gọn chuỗi quan hệ để tránh dài ngoằng và tăng tỷ lệ cache (Chưa cần chạy logic phức tạp, đẩy qua DB xử lý)
export function reduceKinshipChain(chain: string): string {
  // Tương lai có thể map `father.wife` -> `stepmother` ở tầng App nếu muốn
  return chain;
}
