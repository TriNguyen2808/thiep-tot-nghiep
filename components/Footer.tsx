'use client';

import React from 'react';
import { Heart, Radio, ArrowUp } from 'lucide-react';

export default function Footer({ onReplayRadio }: { onReplayRadio: () => void }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-slate-200 bg-white text-slate-500 py-10 px-4 mt-16">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        {/* Nút Xem lại Radio & Lên đầu trang */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onReplayRadio}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-navy-950 text-xs font-mono border border-slate-200 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-navy-900" />
            <span>Phát Lại Đoạn Mở Đầu Radio 📻</span>
          </button>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Về Đầu Trang</span>
          </button>
        </div>

        {/* Lời cảm ơn */}
        <div className="pt-2">
          <p className="font-cursive text-2xl text-navy-950 font-bold">
            Trí Nguyễn
          </p>
          <p className="font-serif italic text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            &ldquo;Cảm ơn vì thanh xuân này đã có bạn đồng hành. Hẹn gặp bạn trong ngày tốt nghiệp thật trọn vẹn!&rdquo;
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 text-[10px] font-mono text-slate-400">
          <p>© 2026 Trí Nguyễn • Graduation Day Celebration</p>
        </div>
      </div>
    </footer>
  );
}
