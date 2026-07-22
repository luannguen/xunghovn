"use client";

import { useState } from 'react';
import { X, Search, Zap, Check } from 'lucide-react';
import { KINSHIP_PRESETS, KinshipPreset } from '@/lib/kinshipExpander';
import { Ordinal } from '@/lib/kinshipLogic';

const ORDINAL_OPTIONS: { value: Ordinal; label: string }[] = [
  { value: 'none', label: '-- Không chọn thứ --' },
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

interface QuickAddKinshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExpand: (steps: any[], ordinal: Ordinal) => void;
}

export function QuickAddKinshipModal({ isOpen, onClose, onConfirmExpand }: QuickAddKinshipModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<KinshipPreset | null>(KINSHIP_PRESETS[0]);
  const [selectedOrdinal, setSelectedOrdinal] = useState<Ordinal>('none');

  if (!isOpen) return null;

  const filteredPresets = KINSHIP_PRESETS.filter(p => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleConfirm = () => {
    if (!selectedPreset) return;
    onConfirmExpand(selectedPreset.steps, selectedOrdinal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Thêm Nhanh Theo Vai Vế</h3>
              <p className="text-xs text-slate-500">Tự động phóng tác & vẽ nhánh cây gia phả chỉ với 1 click</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhanh vai vế (ví dụ: Bác, Dì, Cháu nội, Bố vợ...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'ALL', label: 'Tất Cả' },
              { key: 'NOI', label: 'Họ Nội' },
              { key: 'NGOAI', label: 'Họ Ngoại' },
              { key: 'VO_CHONG', label: 'Bên Vợ/Chồng' },
              { key: 'CON_CHAU', label: 'Con Cháu' },
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 max-h-[350px]">
          {filteredPresets.map(preset => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-0.5">{preset.name}</h4>
                  <p className="text-[11px] text-slate-500">{preset.description}</p>
                </div>
                {isSelected && (
                  <span className="self-end text-emerald-600 font-bold text-xs flex items-center gap-1 mt-2">
                    <Check size={14} /> Đã chọn
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Config (Ordinal) */}
        {selectedPreset && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Thứ bậc chọn thêm:</label>
              <select
                className="p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none font-medium text-slate-700 flex-1 max-w-[200px]"
                value={selectedOrdinal}
                onChange={(e) => setSelectedOrdinal(e.target.value as Ordinal)}
              >
                {ORDINAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <Zap size={14} /> Tự Động Phóng Tác Nhánh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
