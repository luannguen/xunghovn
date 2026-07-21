"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function MobileLayout() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-orange-50 to-orange-100 p-4 font-sans text-slate-800">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
          Xưng Hô VN
        </h1>
        <p className="text-sm text-slate-500">Sổ tay Gia phả</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/40"
          >
            <h2 className="text-xl font-semibold mb-6 text-center">Bạn muốn tra cứu cách xưng hô với ai?</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-white hover:bg-orange-50 rounded-2xl shadow-sm text-lg font-medium transition-colors border border-orange-100 min-h-[44px]"
              >
                Nhánh Nội (Bố)
              </button>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-white hover:bg-rose-50 rounded-2xl shadow-sm text-lg font-medium transition-colors border border-rose-100 min-h-[44px]"
              >
                Nhánh Ngoại (Mẹ)
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/40"
          >
            <h2 className="text-xl font-semibold mb-6 text-center">Đang phát triển...</h2>
            <button 
                onClick={() => setStep(1)}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-2xl shadow-sm text-lg font-medium min-h-[44px]"
              >
                Quay lại
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
