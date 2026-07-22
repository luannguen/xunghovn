"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  NodeChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useKinshipTree } from '@/hooks/useKinshipTree';
import { getLayoutedElements } from '@/lib/layoutElements';
import { CustomKinshipNode } from './CustomKinshipNode';
import { Region } from '@/lib/kinshipLogic';

export default function DesktopLayout() {
  const { nodes: kinNodes, region, changeRegion, addRelation, editRelation, removeNode, resetTree, isLoading } = useKinshipTree();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

  // Ref lưu trữ toạ độ kéo-thả thủ công của người dùng
  const customPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  const nodeTypes = useMemo<NodeTypes>(() => ({ custom: CustomKinshipNode }), []);

  // Đóng gói logic callback cho Node
  const nodeDataFunctions = useMemo(() => ({
    onAddRelation: async (id: string, rel: any, ageOffset: any, ordinal: any) => 
      await addRelation(id, rel, ageOffset, ordinal),
    onEditRelation: async (id: string, rel: any, ageOffset: any, ordinal: any) => 
      await editRelation(id, rel, ageOffset, ordinal),
    onRemoveNode: (id: string) => {
      delete customPositionsRef.current[id];
      removeNode(id);
    },
  }), [addRelation, editRelation, removeNode]);

  // Xử lý sự kiện kéo-thả: Lưu vị trí người dùng kéo vào Ref
  const handleNodesChange = (changes: NodeChange<Node>[]) => {
    onNodesChange(changes);
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        customPositionsRef.current[change.id] = change.position;
      }
    });
  };

  useEffect(() => {
    // 1. Tạo node cơ bản
    const rawNodes: Node[] = kinNodes.map((kn) => {
      const childrenRels = kinNodes.filter(c => c.parentId === kn.id).map(c => c.relation);
      return {
        id: kn.id,
        position: customPositionsRef.current[kn.id] || { x: 0, y: 0 },
        type: 'custom',
        data: { 
          kinshipNode: kn,
          childrenRelations: childrenRels,
          ...nodeDataFunctions
        },
      };
    });

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

    // Ghi đè toạ độ kéo-thả thủ công nếu node đó đã từng được kéo
    const finalNodes = layoutedNodes.map(node => {
      if (customPositionsRef.current[node.id]) {
        return {
          ...node,
          position: customPositionsRef.current[node.id]
        };
      }
      return node;
    });

    setNodes([...finalNodes]);
    setEdges([...layoutedEdges]);
  }, [kinNodes, layoutDirection, setNodes, setEdges, nodeDataFunctions]);

  const handleReset = () => {
    customPositionsRef.current = {};
    resetTree();
  };

  const REGION_OPTIONS: { key: Region; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Toàn Quốc', icon: '🌐' },
    { key: 'NORTH', label: 'Miền Bắc', icon: '🏛️' },
    { key: 'CENTRAL', label: 'Miền Trung', icon: '🏺' },
    { key: 'SOUTH', label: 'Miền Nam', icon: '🌴' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
            VN
          </div>
          <div>
            <h1 className="text-xl font-black text-emerald-700 tracking-tight">Xưng Hô VN</h1>
            <p className="text-xs text-slate-500 font-medium">Từ điển Gia Phả & Nhẩm Danh Xưng Việt Nam</p>
          </div>
        </div>

        {/* Region Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          {REGION_OPTIONS.map((reg) => (
            <button
              key={reg.key}
              onClick={() => changeRegion(reg.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                region === reg.key 
                  ? 'bg-white text-emerald-700 shadow-md font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{reg.icon}</span>
              <span>{reg.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setLayoutDirection(prev => prev === 'TB' ? 'LR' : 'TB')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 shadow-sm transition-all"
            title="Đổi hướng sơ đồ"
          >
            Hướng cây: {layoutDirection === 'TB' ? 'Dọc (Hàng ngày)' : 'Ngang (Thế hệ)'}
          </button>
          
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-medium hover:bg-rose-100 shadow-sm transition-all"
          >
            Làm mới sơ đồ
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          nodesDraggable={true}
        >
          <Controls />
          <MiniMap nodeColor="#10b981" />
          <Background gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
        
        {isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 z-50 animate-pulse">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
            Đang tính toán xưng hô theo vùng miền...
          </div>
        )}
      </main>
    </div>
  );
}
