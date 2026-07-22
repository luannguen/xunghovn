import { memo, useState } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
import { Plus, Edit2, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { KinshipNode, RELATION_LABELS, RelationType } from '@/hooks/useKinshipTree';
import { getAvailableRelations, Ordinal, AgeOffset, isOrdinalAllowed } from '@/lib/kinshipLogic';

const ORDINAL_OPTIONS: { value: Ordinal; label: string }[] = [
  { value: 'none', label: '-- Không chọn --' },
  { value: 'first', label: 'Thứ Cả / Hai' },
  { value: 'second', label: 'Thứ Ba' },
  { value: 'third', label: 'Thứ Tư' },
  { value: 'fourth', label: 'Thứ Năm' },
  { value: 'fifth', label: 'Thứ Sáu' },
  { value: 'sixth', label: 'Thứ Bảy' },
  { value: 'seventh', label: 'Thứ Tám' },
  { value: 'eighth', label: 'Thứ Chín' },
  { value: 'youngest', label: 'Em Út / Con Út' },
];

export const CustomKinshipNode = memo(({ data, isConnectable, selected }: any) => {
  const nodeData = data.kinshipNode as KinshipNode;
  const isRoot = nodeData.relation === 'root';
  const childrenRelations = data.childrenRelations || [];

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Lấy danh sách quan hệ được phép, loại bỏ trùng lặp ngược và độc bản
  const { allowed, warnings } = getAvailableRelations(nodeData.gender, childrenRelations, nodeData.gender);
  const [selectedRel, setSelectedRel] = useState<RelationType>(allowed[0] || 'father');
  const [selectedOrdinal, setSelectedOrdinal] = useState<Ordinal>('none');
  const [selectedAgeOffset, setSelectedAgeOffset] = useState<AgeOffset>('older');
  const [showLGBTWarning, setShowLGBTWarning] = useState(false);

  const onInitAdd = () => {
    setSelectedRel(allowed[0] || 'father');
    setSelectedOrdinal('none');
    setSelectedAgeOffset('older');
    setIsAdding(true);
  };

  const onInitEdit = () => {
    setSelectedRel(nodeData.relation === 'root' ? 'father' : (nodeData.relation as RelationType));
    setSelectedOrdinal(nodeData.ordinal || 'none');
    setSelectedAgeOffset(nodeData.ageOffset || 'older');
    setIsEditing(true);
  };

  const handleConfirm = () => {
    if (warnings[selectedRel] === 'LGBT') {
      setShowLGBTWarning(true);
      return;
    }
    proceedConfirm();
  };

  const proceedConfirm = () => {
    if (isAdding) {
      data.onAddRelation(nodeData.id, selectedRel, selectedAgeOffset, selectedOrdinal);
    } else {
      data.onEditRelation(nodeData.id, selectedRel, selectedAgeOffset, selectedOrdinal);
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

  const isSonOrDaughter = selectedRel === 'son' || selectedRel === 'daughter';
  const canShowOrdinal = isOrdinalAllowed(selectedRel);

  return (
    <div className={`relative bg-white rounded-2xl p-4 min-w-[220px] border-2 shadow-sm transition-all
      ${selected ? 'border-emerald-500 shadow-emerald-100 shadow-xl' : 'border-slate-200'}
    `}>
      <NodeToolbar isVisible={selected} position={Position.Top} className="flex flex-col gap-2 mb-2 items-center">
        {/* Action Buttons */}
        {!isAdding && !isEditing && !showLGBTWarning && (
          <div className="flex gap-2">
            <button 
              onClick={onInitAdd}
              className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95 flex items-center gap-1 text-xs font-semibold px-3"
              title="Thêm nhánh con"
            >
              <Plus size={16} /> Thêm
            </button>
            {!isRoot && (
              <>
                <button 
                  onClick={onInitEdit}
                  className="p-2 bg-white hover:bg-amber-50 text-amber-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
                  title="Sửa quan hệ"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={onDelete}
                  className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
                  title="Xoá Node và các nhánh con"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Form Selector Toolbar */}
        {(isAdding || isEditing) && !showLGBTWarning && (
          <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 p-3 items-stretch w-72 gap-2 animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="text-xs font-bold text-slate-500 mb-1 border-b pb-1 flex justify-between">
              <span>{isAdding ? 'Thêm Mối Quan Hệ' : 'Chỉnh Sửa Quan Hệ'}</span>
              <button onClick={closeAll} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
            </div>

            {/* Chọn Mối quan hệ */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mối quan hệ:</label>
              <select
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-xs font-medium text-slate-700"
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
            </div>

            {/* Vế tuổi nếu là Con trai / Con gái của Bố Mẹ */}
            {isSonOrDaughter && (nodeData.relation === 'father' || nodeData.relation === 'mother') && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Độ tuổi so với bạn (Tôi):</label>
                <div className="flex gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="ageOffset" 
                      value="older" 
                      checked={selectedAgeOffset === 'older'}
                      onChange={() => setSelectedAgeOffset('older')}
                    /> Lớn hơn (Anh/Chị)
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="ageOffset" 
                      value="younger" 
                      checked={selectedAgeOffset === 'younger'}
                      onChange={() => setSelectedAgeOffset('younger')}
                    /> Nhỏ hơn (Em)
                  </label>
                </div>
              </div>
            )}

            {/* Ô Chọn Thứ bậc CHỈ HIỂN THỊ nếu vai vế cho phép (Anh/Chị/Em/Chú/Bác...) */}
            {canShowOrdinal && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Thứ bậc gia đình:</label>
                <select
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-xs font-medium text-slate-700"
                  value={selectedOrdinal}
                  onChange={(e) => setSelectedOrdinal(e.target.value as Ordinal)}
                >
                  {ORDINAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={allowed.length === 0}
              className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Check size={16} /> Xác nhận
            </button>
          </div>
        )}

        {/* LGBT Warning Overlay */}
        {showLGBTWarning && (
          <div className="bg-white rounded-lg shadow-2xl border-2 border-amber-200 p-4 flex flex-col items-center w-64 animate-in slide-in-from-bottom-2 z-50">
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
