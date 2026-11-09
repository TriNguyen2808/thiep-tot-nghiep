'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GRADUATE_INFO } from '@/data/initialData';

export default function HeroBanner() {
  return (
    <div className="relative pt-8 pb-4 px-4 text-center overflow-hidden">
      {/* Tia sáng nhẹ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-gradient-to-b from-blue-100/50 via-amber-50/40 to-transparent blur-3xl pointer-events-none" />

      {/* Dải Banner Y2K chạy chữ */}
      <div className="max-w-3xl mx-auto mb-6 overflow-hidden rounded-full border border-slate-200 bg-white/90 py-1.5 px-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest text-navy-900 font-bold">
          <span>🎓 GRADUATION 2026</span>
          <span>•</span>
          <span>TRÍ NGUYỄN</span>
          <span>•</span>
          <span>TÂN CỬ NHÂN ✨</span>
        </div>
      </div>

      {/* Khung ảnh Photobooth 3 tấm của Trí Nguyễn Y2K */}
      <div className="max-w-2xl mx-auto my-4 flex items-center justify-center gap-3 sm:gap-5">
        {/* Tấm 1: Nụ cười */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: -3 }}
          className="polaroid-card -rotate-2 w-28 sm:w-40 border border-slate-200 relative"
        >
          <div className="washi-tape -top-2 left-2 rotate-[-10deg] !w-14 text-[8px] font-bold text-navy-950 flex items-center justify-center">
            #SMILE
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Trí Nguyễn nụ cười tốt nghiệp"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center font-cursive text-xs text-navy-900">Rạng rỡ • 2026</p>
        </motion.div>

        {/* Tấm 2: Trọng tâm - Áo cử nhân */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: 0 }}
          className="polaroid-card rotate-1 w-32 sm:w-48 border-2 border-amber-400/80 shadow-lg relative z-10"
        >
          <div className="washi-tape -top-2.5 right-3 rotate-[5deg] !w-20 text-[8px] font-bold text-navy-950 flex items-center justify-center">
            ★ CỬ NHÂN ★
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded bg-slate-100">
            <img
              src={GRADUATE_INFO.gownImage}
              alt="Trí Nguyễn Áo Cử Nhân"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center font-serif font-bold text-xs sm:text-sm text-navy-950">
            Trí Nguyễn
          </p>
        </motion.div>

        {/* Tấm 3: Bạn bè */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: 3 }}
          className="polaroid-card rotate-3 w-28 sm:w-40 border border-slate-200 relative"
        >
          <div className="washi-tape -top-2 right-2 rotate-[6deg] washi-tape-blue !w-14 text-[8px] font-bold text-navy-900 flex items-center justify-center">
            #FRIENDS
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80"
              alt="Kỷ niệm bạn bè"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center font-cursive text-xs text-navy-900">Bên nhau</p>
        </motion.div>
      </div>
    </div>
  );
}

