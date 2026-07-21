"use client";

import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useKinshipTree, RELATION_LABELS, RelationType, KinshipNode } from '@/hooks/useKinshipTree';

const nodeStyle = {
  background: '#ffffff',
  color: '#0f172a',
  borderRadius: '12px',
  padding: '16px',
  border: '2px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  width: 180,
  textAlign: 'center' as const,
  fontWeight: 'bold',
};

const selectedNodeStyle = {
  ...nodeStyle,
  border: '2px solid #10b981',
  boxShadow: '0 10px 15px -3px rgb(16 185 129 / 0.3)',
};

export default function DesktopLayout() {
  const { nodes: kinNodes, addRelation, resetTree, isLoading } = useKinshipTree();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');

  // Sync KinshipTree state with React Flow state
  useEffect(() => {
    // Generate flow nodes
    const newFlowNodes: Node[] = kinNodes.map((kn, idx) => {
      // Basic layout algorithm: just line them up vertically for now, 
      // or if it's a tree, we could use dagre, but let's do a simple diagonal/vertical offset
      return {
        id: kn.id,
        position: { x: 250 + (idx * 50), y: 100 + (idx * 150) }, // simple waterfall layout
        data: { 
          label: (
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-normal mb-1">{kn.relation === 'root' ? 'Bắt đầu' : RELATION_LABELS[kn.relation]}</span>
              <span className="text-lg text-emerald-700">{kn.label}</span>
            </div>
          ) 
        },
        style: selectedNodeId === kn.id ? selectedNodeStyle : nodeStyle,
      };
    });

    // Generate flow edges
    const newFlowEdges: Edge[] = kinNodes
      .filter(kn => kn.parentId)
      .map(kn => ({
        id: `e-${kn.parentId}-${kn.id}`,
        source: kn.parentId!,
        target: kn.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      }));

    setNodes(newFlowNodes);
    setEdges(newFlowEdges);
  }, [kinNodes, selectedNodeId, setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleAddRelation = async (relation: RelationType) => {
    if (!selectedNodeId) return;
    const newNode = await addRelation(selectedNodeId, relation);
    if (newNode) {
      setSelectedNodeId(newNode.id);
    }
  };

  const selectedKinNode = kinNodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      <aside className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-3xl font-black text-emerald-600 mb-1 tracking-tight">Xưng Hô VN</h1>
          <p className="text-sm text-slate-500 font-medium">Sơ đồ Gia phả (Desktop)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {selectedKinNode ? (
            <div className="mb-8">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Đang chọn nhánh:</p>
                <h2 className="text-3xl font-bold text-slate-800">{selectedKinNode.label}</h2>
                
                {selectedKinNode.term && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs font-medium text-center">
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="block text-slate-400 mb-1">Bắc</span>
                        <span className="text-slate-700">{selectedKinNode.term.north}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="block text-slate-400 mb-1">Trung</span>
                        <span className="text-slate-700">{selectedKinNode.term.central}</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded-lg">
                        <span className="block text-slate-400 mb-1">Nam</span>
                        <span className="text-slate-700">{selectedKinNode.term.south}</span>
                      </div>
                    </div>
                    {selectedKinNode.term.description && (
                      <p className="text-sm text-slate-600 mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        {selectedKinNode.term.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <h3 className="text-sm font-semibold mb-3 text-slate-700 uppercase tracking-wider">
                Mở rộng nhánh này:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(RELATION_LABELS) as RelationType[]).map((rel) => (
                  <button
                    key={rel}
                    disabled={isLoading}
                    onClick={() => handleAddRelation(rel)}
                    className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 rounded-xl shadow-sm text-sm font-medium transition-all border border-slate-200 text-slate-700 text-left"
                  >
                    + {RELATION_LABELS[rel]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center mt-10 italic">Hãy bấm vào một ô trên sơ đồ để thao tác.</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
           <button 
            onClick={() => { resetTree(); setSelectedNodeId('root'); }}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
           >
             Làm mới sơ đồ
           </button>
        </div>
      </aside>

      <main className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
        >
          <Controls />
          <MiniMap nodeColor={(n) => {
            if (n.id === selectedNodeId) return '#10b981';
            return '#e2e8f0';
          }} />
          <Background gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>
      </main>
    </div>
  );
}
