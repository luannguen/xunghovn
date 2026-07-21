"use client";

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 400, y: 100 }, data: { label: 'Ông Bà Nội' }, style: { background: '#22c55e', color: 'white', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 300, y: 250 }, data: { label: 'Bố' }, style: { background: '#3b82f6', color: 'white', borderRadius: '8px', padding: '10px' } },
  { id: '3', position: { x: 500, y: 250 }, data: { label: 'Bác Trưởng' }, style: { background: '#10b981', color: 'white', borderRadius: '8px', padding: '10px' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', label: 'Con trai' },
  { id: 'e1-3', source: '1', target: '3', label: 'Con trưởng' },
];

export default function DesktopLayout() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm z-10">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">Xưng Hô VN</h1>
        <p className="text-slate-500 mb-8">Bản đồ Gia phả (Desktop)</p>
        
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Công cụ</h2>
          <button className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl mb-3 border border-emerald-200 transition-colors text-left font-medium flex items-center justify-between">
            Thêm người thân
            <span className="text-xl">+</span>
          </button>
          <button className="w-full py-3 px-4 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-left font-medium">
            Phân tích danh xưng
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <MiniMap />
          <Background gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
      </main>
    </div>
  );
}
