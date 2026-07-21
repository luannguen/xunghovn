import { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { KinshipNode, RELATION_LABELS, RelationType } from '@/hooks/useKinshipTree';

const relationOptions = Object.keys(RELATION_LABELS) as RelationType[];

export const CustomKinshipNode = memo(({ data, isConnectable, selected }: any) => {
  const nodeData = data.kinshipNode as KinshipNode;
  const isRoot = nodeData.relation === 'root';

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRel, setSelectedRel] = useState<RelationType>('father');

  const onAddConfirm = () => {
    data.onAddRelation(nodeData.id, selectedRel);
    setIsAdding(false);
  };

  const onEditConfirm = () => {
    data.onEditRelation(nodeData.id, selectedRel);
    setIsEditing(false);
  };

  const onDelete = () => {
    data.onRemoveNode(nodeData.id);
  };

  return (
    <div className={`relative bg-white rounded-2xl p-4 min-w-[200px] border-2 shadow-sm transition-all
      ${selected ? 'border-emerald-500 shadow-emerald-100 shadow-xl' : 'border-slate-200'}
    `}>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex gap-2 mb-2">
        {!isAdding && !isEditing && (
          <>
            <button 
              onClick={() => setIsAdding(true)}
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
          </>
        )}

        {(isAdding || isEditing) && (
          <div className="flex bg-white rounded-lg shadow-xl border border-slate-200 p-1 items-center">
            <select
              className="p-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm mr-2"
              value={selectedRel}
              onChange={(e) => setSelectedRel(e.target.value as RelationType)}
            >
              {relationOptions.map((rel) => (
                <option key={rel} value={rel}>{RELATION_LABELS[rel]}</option>
              ))}
            </select>
            <button
              onClick={isAdding ? onAddConfirm : onEditConfirm}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => { setIsAdding(false); setIsEditing(false); }}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-md"
            >
              <X size={18} />
            </button>
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
      
      <div className="flex flex-col text-center">
        <span className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
          {isRoot ? 'Bắt đầu' : RELATION_LABELS[nodeData.relation as RelationType]}
        </span>
        <h3 className="text-2xl font-black text-emerald-700 tracking-tight">
          {nodeData.label}
        </h3>
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
