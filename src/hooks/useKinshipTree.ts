import { useState, useCallback } from 'react';
import { getKinshipTerm, RegionalTerm } from '@/services/kinshipService';
import { GENDER_MAP, Ordinal, AgeOffset, Region, formatRegionalLabel, resolveEquivalentRelation, reduceKinshipChain } from '@/lib/kinshipLogic';

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

// Các vai vế trực tiếp không ghép chữ "của [Parent]" khi tạo nhãn fallback
const DIRECT_RELATIONS: Set<string> = new Set([
  'father', 'mother', 'husband', 'wife', 
  'son', 'daughter', 'brother_older', 'brother_younger', 
  'sister_older', 'sister_younger'
]);

export type KinshipNode = {
  id: string;
  parentId: string | null;
  relation: RelationType | 'root';
  label: string;
  chain: string;
  term: RegionalTerm | null;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  ordinal?: Ordinal;
  ageOffset?: AgeOffset;
};

export function useKinshipTree() {
  const [nodes, setNodes] = useState<KinshipNode[]>([
    { id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null, gender: 'UNKNOWN', ordinal: 'none' }
  ]);
  const [region, setRegion] = useState<Region>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const addRelation = useCallback(async (
    parentId: string, 
    requestedRelation: RelationType, 
    ageOffset: AgeOffset = 'older',
    ordinal: Ordinal = 'none'
  ) => {
    setIsLoading(true);
    setNodes(prevNodes => {
      const parentNode = prevNodes.find(n => n.id === parentId);
      if (!parentNode) return prevNodes;

      // 1. Quy đổi quan hệ tương đương (VD: Con trai của Bố/Mẹ -> Anh/Em trai)
      const resolvedRel = resolveEquivalentRelation(parentNode.relation, requestedRelation, ageOffset);

      // 2. Rút gọn chuỗi quan hệ (VD: wife.father.wife -> wife.mother)
      const rawChain = parentNode.chain ? `${parentNode.chain}.${resolvedRel}` : resolvedRel;
      const newChain = reduceKinshipChain(rawChain);

      const newNodeId = `${parentId}-${resolvedRel}-${Date.now()}`;
      
      const defaultLabel = RELATION_LABELS[resolvedRel];

      // Nếu quan hệ thuộc nhóm trực tiếp (Anh/Chị/Em/Con/Bố/Mẹ), KHÔNG ghép "của Mẹ" hay "của Bố"
      let fallbackBase = defaultLabel;
      if (parentNode.id !== 'root' && !DIRECT_RELATIONS.has(resolvedRel) && !DIRECT_RELATIONS.has(newChain)) {
        fallbackBase = `${defaultLabel} của ${parentNode.label}`;
      }

      const newGender = GENDER_MAP[resolvedRel];

      // Khởi tạo node tạm thời
      const newNode: KinshipNode = {
        id: newNodeId,
        parentId,
        relation: resolvedRel,
        label: 'Đang tính...',
        chain: newChain,
        term: null,
        gender: newGender,
        ordinal,
        ageOffset
      };

      // Query DB
      getKinshipTerm(newChain).then(term => {
        setNodes(current => current.map(n => {
          if (n.id === newNodeId) {
            const rawLabel = term ? term.north : fallbackBase;
            const formattedLabel = formatRegionalLabel(rawLabel, ordinal, region, term, resolvedRel);
            return { ...n, term, label: formattedLabel };
          }
          return n;
        }));
        setIsLoading(false);
      });

      return [...prevNodes, newNode];
    });
  }, [region]);

  const editRelation = useCallback(async (
    nodeId: string, 
    newRelation: RelationType,
    ageOffset: AgeOffset = 'older',
    ordinal: Ordinal = 'none'
  ) => {
    setIsLoading(true);
    
    let tempNodes = [...nodes];
    const targetIdx = tempNodes.findIndex(n => n.id === nodeId);
    if (targetIdx === -1) {
      setIsLoading(false);
      return;
    }

    const parent = tempNodes.find(n => n.id === tempNodes[targetIdx].parentId);
    const resolvedRel = parent ? resolveEquivalentRelation(parent.relation, newRelation, ageOffset) : newRelation;

    tempNodes[targetIdx] = { 
      ...tempNodes[targetIdx], 
      relation: resolvedRel,
      ordinal,
      ageOffset 
    };

    const updateNodeAndChildren = async (currentId: string) => {
      const idx = tempNodes.findIndex(n => n.id === currentId);
      if (idx === -1) return;
      const node = { ...tempNodes[idx] };
      
      if (node.id === 'root' || !node.parentId) {
         node.chain = '';
      } else {
         const p = tempNodes.find(n => n.id === node.parentId);
         const rawChain = p?.chain ? `${p.chain}.${node.relation}` : node.relation;
         node.chain = reduceKinshipChain(rawChain);
      }
      
      const term = await getKinshipTerm(node.chain);
      node.term = term;

      const pNode = tempNodes.find(n => n.id === node.parentId);
      const defaultLabel = RELATION_LABELS[node.relation as RelationType] || 'Tôi';
      
      let fallbackBase = defaultLabel;
      if (pNode && pNode.id !== 'root' && !DIRECT_RELATIONS.has(node.relation) && !DIRECT_RELATIONS.has(node.chain)) {
        fallbackBase = `${defaultLabel} của ${pNode.label}`;
      }

      const rawLabel = term ? term.north : fallbackBase;
      node.label = formatRegionalLabel(rawLabel, node.ordinal || 'none', region, term, node.relation);
      node.gender = GENDER_MAP[node.relation as RelationType];
      
      tempNodes[idx] = node;

      const children = tempNodes.filter(n => n.parentId === currentId);
      for (const child of children) {
        await updateNodeAndChildren(child.id);
      }
    };

    await updateNodeAndChildren(nodeId);
    setNodes(tempNodes);
    setIsLoading(false);
  }, [nodes, region]);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => {
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
    setNodes([{ id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null, gender: 'UNKNOWN', ordinal: 'none' }]);
  }, []);

  const changeRegion = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    setNodes(prev => prev.map(node => {
      if (node.id === 'root') return node;
      const parent = prev.find(n => n.id === node.parentId);
      const defaultLabel = RELATION_LABELS[node.relation as RelationType] || node.label;
      let fallbackBase = defaultLabel;
      if (parent && parent.id !== 'root' && !DIRECT_RELATIONS.has(node.relation) && !DIRECT_RELATIONS.has(node.chain)) {
        fallbackBase = `${defaultLabel} của ${parent.label}`;
      }

      const rawLabel = node.term ? node.term.north : fallbackBase;
      const formattedLabel = formatRegionalLabel(rawLabel, node.ordinal || 'none', newRegion, node.term, node.relation);
      return { ...node, label: formattedLabel };
    }));
  }, []);

  return {
    nodes,
    region,
    changeRegion,
    addRelation,
    editRelation,
    removeNode,
    resetTree,
    isLoading
  };
}
