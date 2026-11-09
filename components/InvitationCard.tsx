'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Mail, Sparkles, Heart, CheckCircle2, Camera, X, ZoomIn } from 'lucide-react';
import { GRADUATE_INFO } from '@/data/initialData';
import { SiteConfig, GuestItem, SidePhotoItem } from '@/types';

interface InvitationCardProps {
  guestName: string;
  guestId?: string;
  siteConfig?: SiteConfig | null;
  onOpenSecretLetter: () => void;
  onOpenCheckin: () => void;
}

export default function InvitationCard({ 
  guestName, 
  guestId, 
  siteConfig, 
  onOpenSecretLetter, 
  onOpenCheckin 
}: InvitationCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [currentGuest, setCurrentGuest] = useState<GuestItem | null>(null);

  // Tìm khách mời tương ứng trong danh sách cấu hình
  useEffect(() => {
    if (siteConfig?.guests && siteConfig.guests.length > 0) {
      const match = siteConfig.guests.find(
        (g) => (guestId && g.id === guestId) || 
               (guestName && g.name.toLowerCase().trim() === guestName.toLowerCase().trim())
      );
      if (match) {
        setCurrentGuest(match);
      }
    }
  }, [guestId, guestName, siteConfig]);

  // Ảnh đầu thư: Ưu tiên ảnh riêng của khách nếu có, không có sẽ lấy ảnh mặc định
  const displayLetterImage = 
    (currentGuest?.customLetterImage && currentGuest.customLetterImage.trim() !== '')
      ? currentGuest.customLetterImage
      : (siteConfig?.defaultLetterImage || GRADUATE_INFO.gownImage);

  // Điều kiện hiển thị nút "Mở thư bí mật":
  // 1. Khách phải có thư bí mật (hoặc có tham số secret=1)
  // 2. Thời điểm hiện tại phải trước ngày 14/11/2026
  const hasSecretLetter = Boolean(
    (currentGuest?.secretLetter && currentGuest.secretLetter.trim().length > 0) ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('secret') === '1')
  );

  const isBeforeDeadline = new Date() < new Date('2026-11-14T00:00:00+07:00');
  const showSecretLetterButton = hasSecretLetter && isBeforeDeadline;

  // Lấy danh sách ảnh bên trái & phải từ cấu hình (hoặc fallback mặc định)
  const leftPhotos = siteConfig?.sidePhotosLeft || [
    { id: 'l-1', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', rotate: -7, position: 'left', top: '3%' },
    { id: 'l-2', src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80', rotate: 8, position: 'left', top: '38%' },
    { id: 'l-3', src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80', rotate: -10, position: 'left', top: '72%' },
  ];

  const rightPhotos = siteConfig?.sidePhotosRight || [
    { id: 'r-1', src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', rotate: 9, position: 'right', top: '5%' },
    { id: 'r-2', src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80', rotate: -6, position: 'right', top: '40%' },
    { id: 'r-3', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', rotate: 11, position: 'right', top: '75%' },
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const yLeft1 = useTransform(scrollYProgress, [0, 1], [-25, 35]);
  const yLeft2 = useTransform(scrollYProgress, [0, 1], [25, -30]);
  const yLeft3 = useTransform(scrollYProgress, [0, 1], [-20, 35]);

  const yRight1 = useTransform(scrollYProgress, [0, 1], [-20, 30]);
  const yRight2 = useTransform(scrollYProgress, [0, 1], [25, -35]);
  const yRight3 = useTransform(scrollYProgress, [0, 1], [-15, 35]);

  const leftYTransforms = [yLeft1, yLeft2, yLeft3];
  const rightYTransforms = [yRight1, yRight2, yRight3];

  const handleScrollToGuestbook = () => {
    const el = document.getElementById('guestbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen max-w-5xl mx-auto px-3 sm:px-6 py-8 md:py-16 flex flex-col items-center justify-center"
    >
      {/* Vệt sáng spotlight từ trên chiếu xuống lá thư */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-96 bg-gradient-to-b from-white/35 via-white/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* ================= ẢNH XUNG QUANH THƯ: BỎ KHUNG TRẮNG, ĐONG ĐƯA QUA LẠI CẢ Ở MOBILE ================= */}
      {/* Cụm ảnh bên Trái */}
      {leftPhotos.map((photo, idx) => (
        <motion.div
          key={`side-l-${photo.id || idx}`}
          animate={{
            rotate: [(photo.rotate || -7) - 3.5, (photo.rotate || -7) + 3.5, (photo.rotate || -7) - 1.5, photo.rotate || -7],
            y: [-7, 7, -4, 0],
            x: [-8, 8, -4, 0],
          }}
          transition={{
            duration: 4.2 + idx * 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          onClick={() => setZoomedPhoto(photo.src)}
          className={`absolute rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/50 cursor-pointer pointer-events-auto hover:scale-108 group transition-all z-0
            w-24 xs:w-28 sm:w-36 lg:w-44
            ${idx === 0 ? 'top-[4%] left-1 sm:-left-36' : ''}
            ${idx === 1 ? 'top-[40%] -left-3 sm:-left-44' : ''}
            ${idx === 2 ? 'top-[75%] left-1 sm:-left-36' : ''}
          `}
          title="Bấm để phóng to xem ảnh"
        >
          <div className="relative aspect-[4/3] bg-slate-900">
            <img src={photo.src} alt="Kỷ niệm Trí Nguyễn" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Cụm ảnh bên Phải */}
      {rightPhotos.map((photo, idx) => (
        <motion.div
          key={`side-r-${photo.id || idx}`}
          animate={{
            rotate: [(photo.rotate || 8) + 3.5, (photo.rotate || 8) - 3.5, (photo.rotate || 8) + 1.5, photo.rotate || 8],
            y: [7, -7, 4, 0],
            x: [8, -8, 4, 0],
          }}
          transition={{
            duration: 4.5 + idx * 0.7,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          onClick={() => setZoomedPhoto(photo.src)}
          className={`absolute rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/50 cursor-pointer pointer-events-auto hover:scale-108 group transition-all z-0
            w-24 xs:w-28 sm:w-36 lg:w-44
            ${idx === 0 ? 'top-[6%] right-1 sm:-right-36' : ''}
            ${idx === 1 ? 'top-[42%] -right-3 sm:-right-44' : ''}
            ${idx === 2 ? 'top-[77%] right-1 sm:-right-36' : ''}
          `}
          title="Bấm để phóng to xem ảnh"
        >
          <div className="relative aspect-[4/3] bg-slate-900">
            <img src={photo.src} alt="Kỷ niệm Trí Nguyễn" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
            </div>
          </div>
        </motion.div>
      ))}

      {/* ================= THƯ MỜI: SCALE THEO PC VÀ MOBILE ================= */}
      <motion.div
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.03, 0.98, 1], 
          y: [40, -10, 4, 0], 
          opacity: 1 
        }}
        transition={{ 
          duration: 0.75, 
          ease: [0.34, 1.56, 0.64, 1]
        }}
        className="relative z-10 w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[500px] md:max-w-[580px] lg:max-w-[640px] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_35px_rgba(255,255,255,0.4)] rounded-3xl overflow-hidden my-auto"
      >
        {/* KHỐI TRÊN: NỀN XANH NAVY + ẢNH (ẢNH RIÊNG HOẶC MẶC ĐỊNH) + CÂU "Biết ơn vì..." */}
        <div className="relative bg-[#0E2A47] p-4 sm:p-6 md:p-8 border-2 border-b-0 border-amber-400/80 rounded-t-3xl overflow-hidden">
          {/* Viền chỉ vàng mảnh bên trong */}
          <div className="absolute inset-2 sm:inset-3 border border-amber-400/40 rounded-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5 sm:gap-6">
            {/* Ảnh của Trí Nguyễn bên trái */}
            <div className="w-28 xs:w-32 sm:w-40 md:w-48 lg:w-52 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/90 shadow-md transform -rotate-2 flex-shrink-0 bg-slate-800">
              <img
                src={displayLetterImage}
                alt="Trí Nguyễn"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Câu "Biết ơn vì..." chữ trắng (LUÔN CĂN TRÁI CẢ MOBILE VÀ PC) */}
            <div className="flex-1 text-left pr-0.5 sm:pr-2">
              <p className="font-serif italic text-white text-xs sm:text-sm md:text-base lg:text-[17px] leading-relaxed drop-shadow-sm text-left">
                &ldquo;Biết ơn vì được đồng hành cùng bạn trong hành trình vừa qua. Ngày tốt nghiệp sẽ trở nên trọn vẹn hơn khi có bạn hiện diện, cùng Trí lưu giữ một trong những khoảnh khắc đáng nhớ nhất của thời sinh viên.&rdquo;
              </p>
              <div className="mt-2 sm:mt-4 text-left">
                <span className="font-serif italic font-bold text-amber-400 text-xs sm:text-sm md:text-base tracking-wide block text-left">
                  Graduation date secured.
                </span>
                <span className="font-serif italic text-amber-300 text-xs sm:text-sm flex items-center justify-start gap-1 mt-0.5 text-left">
                  See you there <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 inline" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI DƯỚI: NỀN TRẮNG + THÂN MỜI [TÊN KHÁCH] ĐẾN THAM DỰ LỄ TỐT NGHIỆP CỦA TRÍ NGUYỄN */}
        <div className="relative bg-white p-5 sm:p-7 md:p-9 border-2 border-t-0 border-slate-200 rounded-b-3xl text-center shadow-inner">
          <p className="font-serif italic text-xs sm:text-sm text-slate-500 mb-0.5">
            Thân mời
          </p>

          <h3 className="font-mango text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-blue-700 tracking-tight my-1 sm:my-2">
            {guestName || 'Bạn Thân Mến'}
          </h3>

          <p className="font-serif italic text-xs sm:text-sm text-slate-500 my-1">
            đến tham dự Lễ tốt nghiệp của
          </p>

          <h4 className="font-mango text-lg sm:text-2xl md:text-3xl font-bold text-navy-950 tracking-tight">
            Trí Nguyễn
          </h4>

          <p className="font-serif text-xs sm:text-sm text-slate-500 mt-1 sm:mt-1.5">
            {siteConfig?.graduationDate || GRADUATE_INFO.date || 'Sáng Thứ Bảy, 14.11.2026'}
          </p>

          {/* ================= CỤM NÚT HÀNH ĐỘNG ================= */}
          <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2.5 sm:gap-3 w-full">
            {/* Hàng 2 nút phụ tiện ích Confirm & Checkin */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
              <motion.button
                onClick={handleScrollToGuestbook}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-2 sm:py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 font-serif text-xs sm:text-sm font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirm</span>
              </motion.button>

              <motion.button
                onClick={onOpenCheckin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-2 sm:py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-serif text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-navy-950" />
                <span>Check-in</span>
              </motion.button>
            </div>

            {/* NÚT "MỞ THƯ BÍ MẬT DÀNH RIÊNG CHO BẠN" - CHỈ HIỆN KHI CÓ THƯ BÍ MẬT & TRƯỚC NGÀY 14/11/2026 */}
            {showSecretLetterButton && (
              <motion.button
                onClick={onOpenSecretLetter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-serif font-bold text-xs sm:text-sm md:text-base border border-white/40 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Mở Thư Bí Mật Dành Riêng Cho Bạn</span>
                <Sparkles className="w-3.5 h-3.5 text-white animate-bounce" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ================= LIGHTBOX PHÓNG TO ẢNH XUNG QUANH THƯ ================= */}
      <AnimatePresence>
        {zoomedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedPhoto(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-xl w-full bg-slate-900 p-2 pb-3 rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden"
            >
              <button
                onClick={() => setZoomedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white z-20 cursor-pointer transition-colors"
                title="Đóng xem ảnh"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
                <img
                  src={zoomedPhoto}
                  alt="Ảnh kỷ niệm phóng to"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-2 text-center">
                <p className="font-serif italic text-xs text-amber-200">
                  Khoảnh khắc thanh xuân cùng Tân Cử Nhân Trí Nguyễn • 2026
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
