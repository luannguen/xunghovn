import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { GENERATION_OFFSET } from './kinshipLogic';
import { RelationType } from '@/hooks/useKinshipTree';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 240;
const nodeHeight = 140;
const RANK_SPACING = 220;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  // Giãn rộng khoảng cách giữa các node cùng hàng (nodesep: 160)
  dagreGraph.setGraph({ rankdir: direction, nodesep: 160, ranksep: RANK_SPACING });

  // 1. Tính thế hệ tuyệt đối (Generation)
  const generationMap: Record<string, number> = { root: 0 };
  const buildGeneration = (parentId: string, currentGen: number) => {
    const children = nodes.filter(n => (n.data as any).kinshipNode?.parentId === parentId);
    children.forEach(c => {
      const rel = (c.data as any).kinshipNode?.relation as RelationType;
      const offset = GENERATION_OFFSET[rel] || 0;
      const gen = currentGen + offset;
      generationMap[c.id] = gen;
      buildGeneration(c.id, gen);
    });
  };
  buildGeneration('root', 0);

  // 2. Cấu hình Dagre Node
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 3. Cấu hình Dagre Edge
  edges.forEach((edge) => {
    const targetNode = nodes.find(n => n.id === edge.target);
    const rel = (targetNode?.data as any)?.kinshipNode?.relation as RelationType;
    const offset = GENERATION_OFFSET[rel] || 0;

    dagreGraph.setEdge(edge.source, edge.target, {
      minlen: offset === 0 ? 0 : 1,
      weight: offset === 0 ? 10 : 1
    });
  });

  dagre.layout(dagreGraph);

  // 4. Áp dụng toạ độ
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const gen = generationMap[node.id] || 0;

    if (isHorizontal) {
      node.position = {
        x: gen * RANK_SPACING,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    } else {
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: gen * RANK_SPACING,
      };
    }

    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
  });

  return { nodes, edges };
};
