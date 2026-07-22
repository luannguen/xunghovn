import { useState, useCallback } from 'react';
import { getKinshipTerm, RegionalTerm } from '@/services/kinshipService';
import { GENDER_MAP, Ordinal, AgeOffset, Region, formatRegionalLabel, resolveEquivalentRelation, reduceKinshipChain } from '@/lib/kinshipLogic';
import { KinshipPathStep } from '@/lib/kinshipExpander';

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

      const resolvedRel = resolveEquivalentRelation(parentNode.relation, requestedRelation, ageOffset);
      const rawChain = parentNode.chain ? `${parentNode.chain}.${resolvedRel}` : resolvedRel;
      const newChain = reduceKinshipChain(rawChain);
      const newNodeId = `${parentId}-${resolvedRel}-${Date.now()}`;
      const defaultLabel = RELATION_LABELS[resolvedRel];

      let fallbackBase = defaultLabel;
      if (parentNode.id !== 'root' && !DIRECT_RELATIONS.has(resolvedRel) && !DIRECT_RELATIONS.has(newChain)) {
        fallbackBase = `${defaultLabel} của ${parentNode.label}`;
      }

      const newGender = GENDER_MAP[resolvedRel];

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

  // Động cơ Phóng tác Tự động Nhánh Gia Phả (Auto Expand Path)
  const autoExpandKinshipPath = useCallback(async (
    steps: KinshipPathStep[],
    finalOrdinal: Ordinal = 'none',
    finalAgeOffset: AgeOffset = 'older'
  ) => {
    setIsLoading(true);
    let currentParentId = 'root';

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const isLast = i === steps.length - 1;
      const stepOrdinal = isLast ? finalOrdinal : (step.ordinal || 'none');
      const stepAgeOffset = isLast ? finalAgeOffset : (step.ageOffset || 'older');

      // Tìm xem node con đã tồn tại chưa
      let currentNodes = nodes;
      let existingChild = currentNodes.find(n => n.parentId === currentParentId && n.relation === step.relation);

      if (existingChild) {
        currentParentId = existingChild.id;
      } else {
        // Tạo node mới và chờ
        await addRelation(currentParentId, step.relation, stepAgeOffset, stepOrdinal);
        // Lấy node vừa tạo làm parent mới
        await new Promise(res => setTimeout(res, 200));
      }
    }
    setIsLoading(false);
  }, [nodes, addRelation]);

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
    autoExpandKinshipPath,
    editRelation,
    removeNode,
    resetTree,
    isLoading
  };
}
