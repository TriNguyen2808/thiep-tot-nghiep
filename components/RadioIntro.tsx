'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, Sparkles, Disc, Music, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RadioIntroProps {
  onComplete: () => void;
  onOpenStart?: () => void;
  guestName: string;
}

export default function RadioIntro({ onComplete, onOpenStart, guestName }: RadioIntroProps) {
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isOpening, setIsOpening] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Hàm mở thiệp & kích hoạt nhạc nền
  const triggerOpen = () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setIsOpening(true);

    // Tự động phát nhạc nền, bỏ toàn bộ tiếng radio
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:start-bgm'));
      }
      onOpenStart?.();
    } catch (err) {
      console.warn('Audio start info:', err);
    }

    // Bắn pháo hoa confetti
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#0B192C', '#C59B27', '#ffffff', '#FF70A6'],
      });
    } catch (err) {
      console.warn('Confetti info:', err);
    }

    // Chuyển sang thiệp mời sau 500ms hiệu ứng
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // Đếm ngược 3 giây CHỈ KHI KHÁCH BẤM VÀO RADIO
  useEffect(() => {
    if (!hasStartedCountdown) return;

    if (countdown <= 0) {
      triggerOpen();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasStartedCountdown, countdown]);

  const handleUserClickRadio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasStartedCountdown) {
      // Lần đầu bấm: kích hoạt đếm ngược và mở nhạc
      setHasStartedCountdown(true);
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('app:start-bgm'));
        }
        onOpenStart?.();
      } catch (err) {}
    } else {
      // Đang đếm ngược mà bấm tiếp: mở ngay lập tức
      triggerOpen();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#6EC2F7] px-4 overflow-hidden select-none"
    >
      {/* Background Soft Glows & Clouds */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-white/35 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/40 blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={handleUserClickRadio}
        className="mb-5 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/80 bg-white/90 backdrop-blur-md shadow-md cursor-pointer hover:bg-white hover:scale-105 transition-all"
      >
        <Radio className="w-4 h-4 text-[#27A4F2] animate-pulse" />
        <span className="text-xs uppercase tracking-widest text-[#0369A1] font-bold font-mono">
          Đài Radio Kỷ Niệm • Lễ Tốt Nghiệp 2026
        </span>
      </motion.div>

      {/* Guest Welcome Pill */}
      {guestName && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#075985] text-sm md:text-base font-serif italic mb-4 text-center font-medium drop-shadow-sm"
        >
          Tần số radio dành riêng cho:{' '}
          <span className="font-bold text-[#0284C7] bg-white/90 px-3 py-0.5 rounded-full border border-sky-200 shadow-sm not-italic">
            {guestName}
          </span>
        </motion.p>
      )}

      {/* CHIẾC ĐÀI RADIO CỔ ĐIỂN RUNG LẮC */}
      <div className="relative cursor-pointer group" onClick={handleUserClickRadio}>
        {/* Anten Radio kim loại */}
        <div className="absolute -top-16 left-12 w-1.5 h-20 bg-gradient-to-t from-slate-400 to-slate-200 rounded-full transform -rotate-12 origin-bottom shadow z-0 border border-slate-300">
          <div className="w-3.5 h-3.5 bg-red-500 rounded-full -top-2 -left-1 absolute animate-ping opacity-75" />
          <div className="w-3.5 h-3.5 bg-red-600 rounded-full -top-1.5 -left-1 absolute border border-white" />
        </div>

        {/* Khung máy Đài Radio Xanh Navy & Vàng Kim */}
        <motion.div
          className={`relative z-10 w-[310px] sm:w-[400px] md:w-[450px] bg-gradient-to-b from-navy-900 via-navy-950 to-black rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-400/90 ${
            !isOpening ? 'animate-radio-shake' : 'scale-105 transition-transform duration-300'
          }`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(197, 155, 39, 0.35)',
          }}
        >
          {/* Quai cầm Radio kim loại phía trên */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-6 border-4 border-amber-400 rounded-t-xl bg-transparent" />

          {/* Washi Tape Y2K */}
          <div className="washi-tape -top-3 -right-3 rotate-6 !w-24 text-[10px] font-bold text-navy-900 flex items-center justify-center uppercase tracking-tighter">
            ★ TRÍ NGUYỄN ★
          </div>

          {/* Dải điều chỉnh tần số FM & Sóng âm */}
          <div className="bg-navy-950/90 rounded-2xl p-4 border border-navy-700/80 mb-5 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mb-2">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                FM 2026.11 MHz
              </span>
              <span className="px-2 py-0.5 rounded bg-red-600/90 border border-white/40 text-white font-bold tracking-widest text-[9px] animate-pulse">
                {hasStartedCountdown ? 'PLAYING' : 'READY'}
              </span>
            </div>

            {/* Thước vạch tần số radio */}
            <div className="relative h-6 bg-black/80 rounded flex items-center px-2 border border-slate-800 shadow-sm">
              <div className="flex justify-between w-full text-[9px] font-mono text-slate-400 select-none">
                <span>88</span>
                <span>92</span>
                <span>96</span>
                <span className="text-amber-400 font-bold">100.GRAD</span>
                <span>104</span>
                <span>108</span>
              </div>
              {/* Kim dò sóng radio đỏ */}
              <div className="absolute top-0 bottom-0 left-[62%] w-1 bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </div>

            {/* Sóng âm thanh nhảy nhót vui tươi */}
            <div className="flex items-center justify-center gap-1.5 h-7 mt-3">
              {[35, 65, 90, 55, 80, 100, 70, 40, 85, 60, 75, 45, 90, 65, 35].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-amber-400 to-yellow-200 rounded-full soundwave-bar"
                  style={{
                    animationDuration: `${0.35 + (i % 5) * 0.12}s`,
                    animationDelay: `${i * 0.04}s`,
                    height: `${h * 0.25}px`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Hàng bên dưới: Màng loa đôi & Cụm đồng hồ đếm ngược */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 items-center">
            {/* Loa trái */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 p-2 border-2 border-amber-400/80 flex items-center justify-center shadow-inner relative">
              <div className="w-full h-full rounded-full border border-dashed border-slate-700 flex items-center justify-center animate-spin-vinyl bg-navy-950">
                <Disc className="w-8 h-8 text-amber-400/80" />
              </div>
            </div>

            {/* Cụm trung tâm: Đồng hồ đếm ngược (CHỈ CHẠY KHI KHÁCH BẤM) */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 mb-1">
                {hasStartedCountdown ? 'Tự mở sau' : 'Chạm để mở'}
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-navy-900 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-serif font-black text-xl sm:text-2xl shadow-lg">
                <motion.span
                  key={hasStartedCountdown ? countdown : 'ready'}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {hasStartedCountdown ? (countdown > 0 ? countdown : '✨') : <Play className="w-5 h-5 fill-amber-300 translate-x-0.5" />}
                </motion.span>
              </div>
            </div>

            {/* Núm vặn âm lượng mạ vàng kim */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 p-2 border-2 border-amber-400/80 flex items-center justify-center shadow-inner">
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-700 to-black border-2 border-amber-400/80 shadow flex items-center justify-center hover:rotate-45 transition-transform">
                <Volume2 className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nút bấm mở đài & xem thiệp (Click để bắt đầu đếm ngược hoặc mở ngay) */}
      <motion.button
        onClick={handleUserClickRadio}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="mt-7 relative group px-7 py-3.5 rounded-full bg-[#0B2545] hover:bg-[#07192F] text-amber-300 font-bold font-sans text-sm md:text-base tracking-wide shadow-2xl flex items-center gap-3 z-20 cursor-pointer overflow-hidden border-2 border-white/80 active:scale-95 transition-all"
      >
        <Music className="w-5 h-5 animate-bounce text-amber-400" />
        <span>
          {hasStartedCountdown
            ? `Đang Bật Đài... (${countdown}s - Bấm để mở ngay)`
            : 'Chạm Vào Đài Radio Để Mở Thiệp'}
        </span>
        <span className="text-xs bg-navy-950 text-amber-400 px-2.5 py-0.5 rounded-full font-mono border border-amber-400/50">
          {hasStartedCountdown ? (countdown > 0 ? `${countdown}s` : 'Mở ngay') : 'START'}
        </span>
      </motion.button>

      <p className="mt-3 text-xs text-[#06385C] font-semibold font-mono text-center max-w-sm drop-shadow-sm">
        {hasStartedCountdown
          ? '⏳ Đài đang đếm ngược mở thư mời...'
          : '💡 Hãy chạm vào chiếc Radio hoặc bấm nút để bắt đầu mở thiệp'}
      </p>
    </motion.div>
  );
}
