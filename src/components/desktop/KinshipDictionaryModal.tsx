"use client";

import { useState } from 'react';
import { X, BookOpen, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { getKinshipTerm, RegionalTerm } from '@/services/kinshipService';
import { RELATION_LABELS, RelationType } from '@/hooks/useKinshipTree';
import { reduceKinshipChain } from '@/lib/kinshipLogic';

interface KinshipDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KinshipDictionaryModal({ isOpen, onClose }: KinshipDictionaryModalProps) {
  const [chainSteps, setChainSteps] = useState<RelationType[]>(['father', 'brother_older']);
  const [resultTerm, setResultTerm] = useState<RegionalTerm | null>(null);
  const [reducedChain, setReducedChain] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddStep = (rel: RelationType) => {
    setChainSteps(prev => [...prev, rel]);
  };

  const handleRemoveStep = (index: number) => {
    setChainSteps(prev => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = async () => {
    if (chainSteps.length === 0) return;
    setIsCalculating(true);
    const rawChain = chainSteps.join('.');
    const reduced = reduceKinshipChain(rawChain);
    setReducedChain(reduced);

    const term = await getKinshipTerm(reduced);
    setResultTerm(term);
    setIsCalculating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const RELATIONS_LIST: { key: RelationType; label: string }[] = [
    { key: 'father', label: 'Bố' },
    { key: 'mother', label: 'Mẹ' },
    { key: 'husband', label: 'Chồng' },
    { key: 'wife', label: 'Vợ' },
    { key: 'son', label: 'Con trai' },
    { key: 'daughter', label: 'Con gái' },
    { key: 'brother_older', label: 'Anh trai' },
    { key: 'brother_younger', label: 'Em trai' },
    { key: 'sister_older', label: 'Chị gái' },
    { key: 'sister_younger', label: 'Em gái' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Từ Điển Tra Cứu & Nhẩm Danh Xưng Việt Nam</h3>
              <p className="text-xs text-slate-500">Nhập chuỗi quan hệ để xem danh xưng 3 vùng miền tức thì</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Step 1: Chuỗi quan hệ hiện tại */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Chuỗi quan hệ xưng hô (Tôi + ...):</label>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px]">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs">Tôi</span>
              {chainSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5 animate-in zoom-in-95">
                  <ArrowRight size={14} className="text-slate-400" />
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs shadow-sm flex items-center gap-1">
                    {RELATION_LABELS[step]}
                    <button onClick={() => handleRemoveStep(idx)} className="text-slate-400 hover:text-rose-500 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Chọn thêm mắt xích */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Thêm mắt xích quan hệ:</label>
            <div className="grid grid-cols-5 gap-1.5">
              {RELATIONS_LIST.map(rel => (
                <button
                  key={rel.key}
                  onClick={() => handleAddStep(rel.key)}
                  className="px-2.5 py-2 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl text-xs font-medium text-slate-700 transition-all text-center"
                >
                  + {rel.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={chainSteps.length === 0 || isCalculating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={16} /> Tra Cứu Danh Xưng Phù Hợp
          </button>

          {/* Step 3: Kết quả Tra Cứu */}
          {resultTerm && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col gap-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Kết Quả Tra Cứu:</span>
                <button
                  onClick={() => handleCopy(`Bắc: ${resultTerm.north} | Trung: ${resultTerm.central} | Nam: ${resultTerm.south}`)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-emerald-200"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block">Miền Bắc</span>
                  <span className="text-lg font-black text-emerald-700">{resultTerm.north}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block">Miền Trung</span>
                  <span className="text-lg font-black text-emerald-700">{resultTerm.central}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block">Miền Nam</span>
                  <span className="text-lg font-black text-emerald-700">{resultTerm.south}</span>
                </div>
              </div>

              {resultTerm.description && (
                <p className="text-xs text-slate-600 italic bg-white p-3 rounded-lg border border-emerald-100">
                  "{resultTerm.description}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
