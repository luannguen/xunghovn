import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { GENERATION_OFFSET, RelationType } from './kinshipLogic';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 120;
const RANK_SPACING = 200; // Khoảng cách giữa các thế hệ

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: RANK_SPACING });

  // 1. Tính toán thế hệ tuyệt đối (Absolute Generation) cho từng Node
  const generationMap: Record<string, number> = { root: 0 };
  const buildGeneration = (parentId: string, currentGen: number) => {
    const children = nodes.filter(n => n.data.kinshipNode.parentId === parentId);
    children.forEach(c => {
      const rel = c.data.kinshipNode.relation as RelationType;
      const offset = GENERATION_OFFSET[rel] || 0;
      const gen = currentGen + offset;
      generationMap[c.id] = gen;
      buildGeneration(c.id, gen);
    });
  };
  buildGeneration('root', 0);

  // 2. Nạp Node vào Dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 3. Nạp Edge vào Dagre
  edges.forEach((edge) => {
    const targetNode = nodes.find(n => n.id === edge.target);
    const rel = targetNode?.data.kinshipNode.relation as RelationType;
    const offset = GENERATION_OFFSET[rel] || 0;
    
    // Ép Dagre xếp cùng rank nếu là người cùng thế hệ (minlen: 0)
    dagreGraph.setEdge(edge.source, edge.target, { 
      minlen: offset === 0 ? 0 : 1,
      weight: offset === 0 ? 10 : 1
    });
  });

  // 4. Chạy thuật toán layout
  dagre.layout(dagreGraph);

  // 5. Ghi đè toạ độ và ép trục toạ độ tuyệt đối theo Thế Hệ (Generational Snapping)
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const gen = generationMap[node.id] || 0;
    
    // Ghi đè trục thẳng hàng theo gen
    if (isHorizontal) {
      node.position = {
        x: gen * RANK_SPACING, // Trục X là thế hệ
        y: nodeWithPosition.y - nodeHeight / 2, // Trục Y do Dagre tính để tránh đè nhau
      };
    } else {
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2, // Trục X do Dagre tính
        y: gen * RANK_SPACING, // Trục Y là thế hệ
      };
    }

    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
  });

  return { nodes, edges };
};
