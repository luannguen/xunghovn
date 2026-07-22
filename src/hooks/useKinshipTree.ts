import { useState, useCallback } from 'react';
import { getKinshipTerm, RegionalTerm } from '@/services/kinshipService';
import { GENDER_MAP } from '@/lib/kinshipLogic';

export type RelationType = 
  | 'father' | 'mother' | 'husband' | 'wife' 
  | 'son' | 'daughter' | 'brother_older' | 'brother_younger' 
  | 'sister_older' | 'sister_younger';

export const RELATION_LABELS: Record<RelationType, string> = {
  father: 'Bố',
  mother: 'Mẹ',
  husband: 'Chồng',
  wife: 'Vợ',
  son: 'Con trai',
  daughter: 'Con gái',
  brother_older: 'Anh trai',
  brother_younger: 'Em trai',
  sister_older: 'Chị gái',
  sister_younger: 'Em gái',
};

export type KinshipNode = {
  id: string;
  parentId: string | null;
  relation: RelationType | 'root';
  label: string;
  chain: string;
  term: RegionalTerm | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
};

export function useKinshipTree() {
  const [nodes, setNodes] = useState<KinshipNode[]>([
    { id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null, gender: 'UNKNOWN' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addRelation = useCallback(async (parentId: string, newRelation: string) => {
    setIsLoading(true);
    setNodes(prevNodes => {
      const parentNode = prevNodes.find(n => n.id === parentId);
      if (!parentNode) return prevNodes;

      const newChain = parentNode.chain ? `${parentNode.chain}.${newRelation}` : newRelation;
      const newNodeId = `${parentId}-${newRelation}-${Date.now()}`;
      
      const fallbackLabel = parentNode.id !== 'root' 
        ? `${RELATION_LABELS[newRelation as RelationType]} của ${parentNode.label}` 
        : RELATION_LABELS[newRelation as RelationType];

      const newGender = GENDER_MAP[newRelation as RelationType];

      // Khởi tạo node tạm thời chưa có danh xưng
      const newNode: KinshipNode = {
        id: newNodeId,
        parentId,
        relation: newRelation,
        label: 'Đang tính...',
        chain: newChain,
        term: null,
        gender: newGender,
      };

      // Chạy tính toán async bên ngoài setNodes
      getKinshipTerm(newChain).then(term => {
        setNodes(current => current.map(n => 
          n.id === newNodeId 
            ? { ...n, term, label: term ? term.north : fallbackLabel } 
            : n
        ));
        setIsLoading(false);
      });

      return [...prevNodes, newNode];
    });
  }, []);

  const editRelation = useCallback(async (nodeId: string, newRelation: RelationType) => {
    setIsLoading(true);
    
    // Tạo mảng mới để tính toán dây chuyền
    let tempNodes = [...nodes];
    const targetIdx = tempNodes.findIndex(n => n.id === nodeId);
    if (targetIdx === -1) {
      setIsLoading(false);
      return;
    }

    // Đổi relation cho node mục tiêu
    tempNodes[targetIdx] = { ...tempNodes[targetIdx], relation: newRelation };

    // Đệ quy cập nhật chain và gửi request cho nhánh
    const updateNodeAndChildren = async (currentId: string) => {
      const idx = tempNodes.findIndex(n => n.id === currentId);
      if (idx === -1) return;
      const node = { ...tempNodes[idx] };
      
      if (node.id === 'root' || !node.parentId) {
         node.chain = '';
      } else {
         const parent = tempNodes.find(n => n.id === node.parentId);
         node.chain = parent?.chain ? `${parent.chain}.${node.relation}` : node.relation;
      }
      
      // Fetch new term
      const term = await getKinshipTerm(node.chain);
      node.term = term;

      const fallbackLabel = parent && parent.id !== 'root' 
        ? `${RELATION_LABELS[node.relation as RelationType]} của ${parent.label}` 
        : RELATION_LABELS[node.relation as RelationType];

      node.label = term ? term.north : (node.relation === 'root' ? 'Tôi' : fallbackLabel);
      node.gender = GENDER_MAP[node.relation as RelationType];
      
      tempNodes[idx] = node;

      // Tìm và đệ quy cập nhật các node con
      const children = tempNodes.filter(n => n.parentId === currentId);
      for (const child of children) {
        await updateNodeAndChildren(child.id);
      }
    };

    await updateNodeAndChildren(nodeId);
    setNodes(tempNodes);
    setIsLoading(false);
  }, [nodes]);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => {
      // Đệ quy tìm tất cả ID của node con cháu cần xoá
      const idsToRemove = new Set<string>([id]);
      
      let added = true;
      while (added) {
        added = false;
        for (const n of prev) {
          if (n.parentId && idsToRemove.has(n.parentId) && !idsToRemove.has(n.id)) {
            idsToRemove.add(n.id);
            added = true;
          }
        }
      }
      return prev.filter(n => !idsToRemove.has(n.id));
    });
  }, []);

  const resetTree = useCallback(() => {
    setNodes([{ id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null, gender: 'UNKNOWN' }]);
  }, []);

  return {
    nodes,
    addRelation,
    editRelation,
    removeNode,
    resetTree,
    isLoading
  };
}
