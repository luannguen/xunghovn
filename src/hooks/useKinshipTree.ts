import { useState, useCallback } from 'react';
import { getKinshipTerm, RegionalTerm } from '@/services/kinshipService';

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
};

export function useKinshipTree() {
  const [nodes, setNodes] = useState<KinshipNode[]>([
    { id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addRelation = useCallback(async (parentId: string, newRelation: RelationType) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return null;

    const newChain = parentNode.chain ? `${parentNode.chain}.${newRelation}` : newRelation;
    
    setIsLoading(true);
    const term = await getKinshipTerm(newChain);
    setIsLoading(false);

    const newNode: KinshipNode = {
      id: `${parentId}-${newRelation}-${Date.now()}`,
      parentId,
      relation: newRelation,
      label: term ? term.north : RELATION_LABELS[newRelation],
      chain: newChain,
      term,
    };

    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [nodes]);

  const removeNode = useCallback((id: string) => {
    // This is simple: just remove the node and its children (recursively if needed, but for now just filter out)
    // A better approach for trees is to find all descendants, but for simplicity we'll just filter by id and parentId.
    // Assuming simple linear wizard for now.
    setNodes(prev => {
      const idx = prev.findIndex(n => n.id === id);
      if (idx === -1) return prev;
      return prev.slice(0, idx); // Cuts off this node and everything after it (good for linear mobile wizard)
    });
  }, []);

  const resetTree = useCallback(() => {
    setNodes([{ id: 'root', parentId: null, relation: 'root', label: 'Tôi', chain: '', term: null }]);
  }, []);

  return {
    nodes,
    addRelation,
    removeNode,
    resetTree,
    isLoading
  };
}
