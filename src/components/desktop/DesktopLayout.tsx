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
import { QuickAddKinshipModal } from './QuickAddKinshipModal';
import { KinshipDictionaryModal } from './KinshipDictionaryModal';
import { Region, Ordinal } from '@/lib/kinshipLogic';
import { Zap, BookOpen, Download } from 'lucide-react';

export default function DesktopLayout() {
  const { nodes: kinNodes, region, changeRegion, addRelation, autoExpandKinshipPath, editRelation, removeNode, resetTree, isLoading } = useKinshipTree();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);

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

  // Xử lý sự kiện kéo-thả
  const handleNodesChange = (changes: NodeChange<Node>[]) => {
    onNodesChange(changes);
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        customPositionsRef.current[change.id] = change.position;
      }
    });
  };

  useEffect(() => {
    const allTreeRelations = kinNodes.map(kn => kn.relation);

    const rawNodes: Node[] = kinNodes.map((kn) => {
      const childrenRels = kinNodes.filter(c => c.parentId === kn.id).map(c => c.relation);
      return {
        id: kn.id,
        position: customPositionsRef.current[kn.id] || { x: 0, y: 0 },
        type: 'custom',
        data: {
          kinshipNode: kn,
          childrenRelations: childrenRels,
          allTreeRelations: allTreeRelations,
          ...nodeDataFunctions
        },
      };
    });

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

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      layoutDirection
    );

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

  const handleConfirmQuickExpand = (steps: any[], ordinal: Ordinal) => {
    autoExpandKinshipPath(steps, ordinal);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(kinNodes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gia-pha-xung-ho-vn-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
            <p className="text-xs text-slate-500 font-medium">Từ điển Gia Phả & Tra Cứu Danh Xưng Việt Nam</p>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-3">
          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Zap size={16} /> ⚡ Thêm Nhanh Vai Vế
          </button>

          {/* Dictionary Lookup Button */}
          <button
            onClick={() => setIsDictionaryOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <BookOpen size={16} /> 📖 Từ Điển Tra Cứu
          </button>

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
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1"
            title="Tải sơ đồ gia phả JSON"
          >
            <Download size={14} /> Xuất Sơ Đồ
          </button>

          <button
            onClick={() => setLayoutDirection(prev => prev === 'TB' ? 'LR' : 'TB')}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 shadow-sm transition-all"
            title="Đổi hướng sơ đồ"
          >
            Hướng: {layoutDirection === 'TB' ? 'Dọc' : 'Ngang'}
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-medium hover:bg-rose-100 shadow-sm transition-all"
          >
            Làm mới
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
            Đang tự động tính toán xưng hô...
          </div>
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddKinshipModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onConfirmExpand={handleConfirmQuickExpand}
      />

      {/* Kinship Dictionary Modal */}
      <KinshipDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />
    </div>
  );
}
