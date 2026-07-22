"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useKinshipTree, RELATION_LABELS, RelationType } from "@/hooks/useKinshipTree";

export default function MobileLayout() {
  const { nodes, addRelation, removeNode, resetTree, isLoading } = useKinshipTree();

  // The linear path is just the array of nodes (since mobile is wizard-style)
  const currentNode = nodes[nodes.length - 1];

  const handleAddRelation = async (relation: RelationType) => {
    await addRelation(currentNode.id, relation);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-orange-50 to-rose-50 p-4 font-sans text-slate-800 overflow-hidden">
      <header className="py-4 text-center z-10 shrink-0">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
          Xưng Hô VN
        </h1>
        <p className="text-sm text-slate-500">Sổ tay Gia phả</p>
      </header>

      <main className="flex-1 flex flex-col relative w-full max-w-sm mx-auto overflow-hidden">
        {/* Lịch sử nhánh đã chọn (Breadcrumbs) */}
        {nodes.length > 1 && (
          <div className="flex overflow-x-auto py-2 mb-4 shrink-0 hide-scrollbar gap-2 items-center">
            {nodes.map((node, idx) => (
              <div key={node.id} className="flex items-center shrink-0">
                <button
                  onClick={() => removeNode(nodes[idx + 1]?.id)} // Cắt bỏ từ node sau đó
                  className="px-3 py-1 rounded-full bg-white border border-rose-100 text-sm font-medium text-rose-600 shadow-sm"
                >
                  {node.label}
                </button>
                {idx < nodes.length - 1 && (
                  <span className="mx-1 text-rose-300">›</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNode.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 flex flex-col items-center"
            >
              {/* Kết quả Node hiện tại */}
              <div className="text-center mb-8 w-full border-b border-rose-100 pb-6">
                <p className="text-sm text-slate-500 mb-1">
                  {currentNode.relation === 'root' ? 'Bạn đang ở vị trí:' : 'Bạn gọi người này là:'}
                </p>
                <h2 className="text-4xl font-black text-rose-600 tracking-tight">
                  {currentNode.label}
                </h2>

                {/* Vùng miền details */}
                {currentNode.term && (
                  <div className="mt-4 flex justify-center gap-2 text-xs font-medium text-slate-500">
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Bắc: {currentNode.term.north}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Trung: {currentNode.term.central}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded-md">Nam: {currentNode.term.south}</span>
                  </div>
                )}
                {currentNode.term?.description && (
                  <p className="mt-3 text-sm text-slate-600 italic">"{currentNode.term.description}"</p>
                )}
              </div>

              {/* Tùy chọn đi tiếp */}
              <h3 className="text-base font-semibold mb-4 text-slate-700 w-full text-left">
                Thêm mối quan hệ tiếp theo:
              </h3>

              <div className="grid grid-cols-2 gap-3 w-full">
                {(Object.keys(RELATION_LABELS) as RelationType[]).map((rel) => (
                  <button
                    key={rel}
                    disabled={isLoading}
                    onClick={() => handleAddRelation(rel)}
                    className="w-full py-3 bg-white hover:bg-orange-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 rounded-2xl shadow-sm text-base font-medium transition-all border border-orange-100 flex items-center justify-center min-h-[44px]"
                  >
                    {RELATION_LABELS[rel]}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nút reset */}
        {nodes.length > 1 && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center z-20">
            <button
              onClick={resetTree}
              className="py-3 px-8 bg-slate-800 text-white rounded-full shadow-lg font-medium active:scale-95 transition-transform min-h-[44px]"
            >
              Bắt đầu lại
            </button>
          </div>
        )}
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
