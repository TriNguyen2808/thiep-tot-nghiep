'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Mail, Sparkles, Heart, CheckCircle2, Camera, X, ZoomIn, GraduationCap } from 'lucide-react';
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

  // Lấy danh sách ảnh bên trái & phải từ cấu hình (mặc định rỗng)
  const rawLeft = siteConfig?.sidePhotosLeft ?? [];
  const rawRight = siteConfig?.sidePhotosRight ?? [];

  // Tự động phân bổ đều 2 bên nếu 1 bên có nhiều ảnh còn bên kia không có
  let leftPhotos = [...rawLeft];
  let rightPhotos = [...rawRight];

  if (rawLeft.length === 0 && rawRight.length > 1) {
    const half = Math.ceil(rawRight.length / 2);
    leftPhotos = rawRight.slice(half);
    rightPhotos = rawRight.slice(0, half);
  } else if (rawRight.length === 0 && rawLeft.length > 1) {
    const half = Math.ceil(rawLeft.length / 2);
    rightPhotos = rawLeft.slice(half);
    leftPhotos = rawLeft.slice(0, half);
  }

  // Hàm tính toán vị trí, góc xoay & nhịp trôi nổi cho từng ảnh
  // ĐẢM BẢO: Trôi nổi ngẫu nhiên, chia đều 2 bên và KHÔNG BAO GIỜ BỊ DÍNH NHAU
  const getPhotoLayout = (idx: number, total: number, side: 'left' | 'right') => {
    // 1. Phân bổ khoảng cách đứng (top %) đều đặn từ trên xuống dưới
    let topPercent: number;
    if (total <= 1) {
      topPercent = side === 'left' ? 42 : 48;
    } else {
      const start = side === 'left' ? 4 : 7;
      const end = side === 'left' ? 84 : 88;
      const step = (end - start) / (total - 1);
      topPercent = start + idx * step;
    }

    // 2. Góc nghiêng ngẫu nhiên tự nhiên
    const leftAngles = [-7.5, 6, -9.5, 8, -6.5, 8.5, -8, 7];
    const rightAngles = [8.5, -7, 9, -8.5, 7, -6.5, 8, -9];
    const baseRotate = side === 'left' 
      ? leftAngles[idx % leftAngles.length]
      : rightAngles[idx % rightAngles.length];

    // 3. Vị trí ngang: so le zigzag (xen kẽ gần - xa) để tạo chiều sâu thị giác
    const isOuter = side === 'left' ? idx % 2 === 0 : idx % 2 === 1;
    const horizontalClass = side === 'left'
      ? (isOuter ? 'left-0.5 xs:left-2 sm:-left-36 md:-left-44 lg:-left-52' : '-left-2 xs:left-0 sm:-left-28 md:-left-36 lg:-left-40')
      : (isOuter ? 'right-0.5 xs:right-2 sm:-right-36 md:-right-44 lg:-right-52' : '-right-2 xs:right-0 sm:-right-28 md:-right-36 lg:-right-40');

    // 4. Thời gian trôi nổi khác nhau cho từng bức ảnh
    const duration = 4.2 + ((idx * 0.7) % 2.5);
    const delay = (idx * 0.35) % 1.5;

    return {
      topPercent,
      baseRotate,
      horizontalClass,
      duration,
      delay,
    };
  };

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

      {/* ================= ẢNH XUNG QUANH THƯ: TRÔI NỔI TỰ NHIÊN, TRẢI ĐỀU 2 BÊN, KHÔNG DÍNH NHAU ================= */}
      {/* Cụm ảnh bên Trái */}
      {leftPhotos.map((photo, idx) => {
        const layout = getPhotoLayout(idx, leftPhotos.length, 'left');
        return (
          <motion.div
            key={`side-l-${photo.id || idx}`}
            style={{
              top: `${layout.topPercent}%`,
            }}
            animate={{
              rotate: [
                layout.baseRotate - 2.5,
                layout.baseRotate + 2.5,
                layout.baseRotate - 1,
                layout.baseRotate,
              ],
              y: [-6, 6, -3, 0],
              x: [-4, 5, -2, 0],
            }}
            transition={{
              duration: layout.duration,
              delay: layout.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            onClick={() => setZoomedPhoto(photo.src)}
            className={`absolute rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/60 cursor-pointer pointer-events-auto hover:scale-110 group transition-transform z-0
              w-22 xs:w-26 sm:w-36 lg:w-44
              ${layout.horizontalClass}
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
        );
      })}

      {/* Cụm ảnh bên Phải */}
      {rightPhotos.map((photo, idx) => {
        const layout = getPhotoLayout(idx, rightPhotos.length, 'right');
        return (
          <motion.div
            key={`side-r-${photo.id || idx}`}
            style={{
              top: `${layout.topPercent}%`,
            }}
            animate={{
              rotate: [
                layout.baseRotate + 2.5,
                layout.baseRotate - 2.5,
                layout.baseRotate + 1,
                layout.baseRotate,
              ],
              y: [6, -6, 3, 0],
              x: [4, -5, 2, 0],
            }}
            transition={{
              duration: layout.duration,
              delay: layout.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            onClick={() => setZoomedPhoto(photo.src)}
            className={`absolute rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/60 cursor-pointer pointer-events-auto hover:scale-110 group transition-transform z-0
              w-22 xs:w-26 sm:w-36 lg:w-44
              ${layout.horizontalClass}
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
        );
      })}

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
            <div className="w-28 xs:w-32 sm:w-40 md:w-48 lg:w-52 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/90 shadow-md transform -rotate-2 flex-shrink-0 bg-slate-800 flex items-center justify-center">
              {displayLetterImage ? (
                <img
                  src={displayLetterImage}
                  alt="Trí Nguyễn"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center text-amber-200">
                  <GraduationCap className="w-10 h-10 sm:w-14 sm:h-14 mb-2 text-amber-300" />
                  <span className="font-serif text-[11px] sm:text-xs font-bold text-amber-100">Lễ Tốt Nghiệp</span>
                  <span className="text-[10px] sm:text-[11px] text-amber-200/80">Trí Nguyễn</span>
                </div>
              )}
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
