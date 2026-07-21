import { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { KinshipNode, RELATION_LABELS, RelationType } from '@/hooks/useKinshipTree';
import { getAvailableRelations } from '@/lib/kinshipLogic';

export const CustomKinshipNode = memo(({ data, isConnectable, selected }: any) => {
  const nodeData = data.kinshipNode as KinshipNode;
  const isRoot = nodeData.relation === 'root';
  const childrenRelations = data.childrenRelations || [];

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { allowed, warnings } = getAvailableRelations(nodeData.gender, childrenRelations);
  // Nếu đang edit, lấy mảng allowed của thằng cha (vì edit là đổi relation của node này so với cha)
  // Tuy nhiên để đơn giản, ta cho phép đổi sang mọi quyền allowed hiện tại trừ những cái đã bị chiếm
  const [selectedRel, setSelectedRel] = useState<RelationType>(allowed[0] || 'father');
  const [showLGBTWarning, setShowLGBTWarning] = useState(false);

  const onInitAdd = () => {
    setSelectedRel(allowed[0]);
    setIsAdding(true);
  }

  const handleConfirm = () => {
    if (warnings[selectedRel] === 'LGBT') {
      setShowLGBTWarning(true);
      return;
    }
    proceedConfirm();
  };

  const proceedConfirm = () => {
    if (isAdding) {
      data.onAddRelation(nodeData.id, selectedRel);
    } else {
      data.onEditRelation(nodeData.id, selectedRel);
    }
    closeAll();
  };

  const closeAll = () => {
    setIsAdding(false);
    setIsEditing(false);
    setShowLGBTWarning(false);
  };

  const onDelete = () => {
    data.onRemoveNode(nodeData.id);
  };

  return (
    <div className={`relative bg-white rounded-2xl p-4 min-w-[200px] border-2 shadow-sm transition-all
      ${selected ? 'border-emerald-500 shadow-emerald-100 shadow-xl' : 'border-slate-200'}
    `}>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex flex-col gap-2 mb-2 items-center">
        {/* Main Toolbar */}
        {!isAdding && !isEditing && !showLGBTWarning && (
          <div className="flex gap-2">
            <button 
              onClick={onInitAdd}
              className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
              title="Thêm nhánh con"
            >
              <Plus size={18} />
            </button>
            {!isRoot && (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-white hover:bg-amber-50 text-amber-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
                  title="Sửa quan hệ"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={onDelete}
                  className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
                  title="Xoá Node và các nhánh con"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Select Toolbar */}
        {(isAdding || isEditing) && !showLGBTWarning && (
          <div className="flex bg-white rounded-lg shadow-xl border border-slate-200 p-1 items-center animate-in fade-in zoom-in-95 duration-200">
            <select
              className="p-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm mr-2 font-medium text-slate-700"
              value={selectedRel}
              onChange={(e) => setSelectedRel(e.target.value as RelationType)}
            >
              {allowed.length === 0 && <option value="" disabled>Hết quan hệ khả dụng</option>}
              {allowed.map((rel) => (
                <option key={rel} value={rel}>
                  {RELATION_LABELS[rel]} {warnings[rel] === 'LGBT' ? ' 🏳️‍🌈' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleConfirm}
              disabled={allowed.length === 0}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md disabled:opacity-50"
            >
              <Check size={18} />
            </button>
            <button
              onClick={closeAll}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* LGBT Warning Modal / Overlay */}
        {showLGBTWarning && (
          <div className="bg-white rounded-lg shadow-2xl border-2 border-amber-200 p-4 flex flex-col items-center w-64 animate-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle size={20} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm text-center mb-1">Cảnh báo logic truyền thống</h4>
            <p className="text-xs text-slate-500 text-center mb-4">
              Trong gia phả truyền thống Việt Nam, Node Nam không thể lấy Chồng (hoặc Nữ lấy Vợ). Bạn đang thêm một quan hệ đồng giới (LGBT). 
            </p>
            <div className="flex w-full gap-2">
              <button 
                onClick={closeAll}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={proceedConfirm}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md text-xs font-semibold transition-colors shadow-sm"
              >
                Vẫn thêm
              </button>
            </div>
          </div>
        )}
      </NodeToolbar>

      {!isRoot && (
        <Handle 
          type="target" 
          position={Position.Top} 
          isConnectable={isConnectable} 
          className="w-3 h-3 bg-emerald-500 border-2 border-white"
        />
      )}
      
      <div className="flex flex-col text-center relative">
        <span className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
          {isRoot ? 'Bắt đầu' : RELATION_LABELS[nodeData.relation as RelationType]}
        </span>
        <h3 className="text-2xl font-black text-emerald-700 tracking-tight">
          {nodeData.label}
        </h3>
        
        {/* Gender Badge */}
        <div className="absolute top-0 right-0 flex gap-1">
          {nodeData.gender === 'MALE' && <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm" title="Nam"></span>}
          {nodeData.gender === 'FEMALE' && <span className="w-2 h-2 rounded-full bg-pink-400 shadow-sm" title="Nữ"></span>}
        </div>

        {nodeData.term && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>Bắc:</span> <span className="font-semibold">{nodeData.term.north}</span>
            </div>
            <div className="flex justify-between">
              <span>Trung:</span> <span className="font-semibold">{nodeData.term.central}</span>
            </div>
            <div className="flex justify-between">
              <span>Nam:</span> <span className="font-semibold">{nodeData.term.south}</span>
            </div>
            {nodeData.term.description && (
              <p className="mt-2 text-xs italic text-slate-400">"{nodeData.term.description}"</p>
            )}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
    </div>
  );
});

CustomKinshipNode.displayName = 'CustomKinshipNode';
