"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useKinshipTree } from '@/hooks/useKinshipTree';
import { getLayoutedElements } from '@/lib/layoutElements';
import { CustomKinshipNode } from './CustomKinshipNode';

export default function DesktopLayout() {
  const { nodes: kinNodes, addRelation, editRelation, removeNode, resetTree, isLoading } = useKinshipTree();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

  const nodeTypes = useMemo<NodeTypes>(() => ({ custom: CustomKinshipNode }), []);

  // Đóng gói logic để custom node có thể gọi được các hàm của hook
  const nodeDataFunctions = useMemo(() => ({
    onAddRelation: async (id: string, rel: any) => await addRelation(id, rel),
    onEditRelation: async (id: string, rel: any) => await editRelation(id, rel),
    onRemoveNode: (id: string) => removeNode(id),
  }), [addRelation, editRelation, removeNode]);

  useEffect(() => {
    // 1. Tạo node cơ bản
    const rawNodes: Node[] = kinNodes.map((kn) => ({
      id: kn.id,
      position: { x: 0, y: 0 }, // Dagre sẽ ghi đè toạ độ này
      type: 'custom',
      data: { 
        kinshipNode: kn,
        ...nodeDataFunctions
      },
    }));

    // 2. Tạo edge cơ bản
    const rawEdges: Edge[] = kinNodes
      .filter(kn => kn.parentId)
      .map(kn => ({
        id: `e-${kn.parentId}-${kn.id}`,
        source: kn.parentId!,
        target: kn.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }));

    // 3. Chạy thuật toán Dagre
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      layoutDirection
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [kinNodes, layoutDirection, setNodes, setEdges, nodeDataFunctions]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-black text-emerald-600 tracking-tight">Xưng Hô VN</h1>
          <p className="text-xs text-slate-500 font-medium">Sơ đồ Gia phả (Desktop)</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setLayoutDirection(prev => prev === 'TB' ? 'LR' : 'TB')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all"
            title="Đổi hướng sơ đồ"
          >
            Đổi hướng cây: {layoutDirection === 'TB' ? 'Dọc' : 'Ngang'}
          </button>
          
          <button 
            onClick={resetTree}
            className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm font-medium hover:bg-rose-100 shadow-sm transition-all"
          >
            Làm mới sơ đồ
          </button>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          nodesDraggable={false} // Vì đã dùng Auto Layout nên khóa kéo thả tay
        >
          <Controls />
          <MiniMap nodeColor="#10b981" />
          <Background gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
        
        {isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl flex items-center gap-2 z-50 animate-pulse">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
            Đang tính toán nhân xưng...
          </div>
        )}
      </main>
    </div>
  );
}
