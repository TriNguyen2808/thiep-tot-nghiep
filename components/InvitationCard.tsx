'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, Heart, CheckCircle2, Camera, X, ZoomIn, GraduationCap } from 'lucide-react';
import { GRADUATE_INFO } from '@/data/initialData';
import { SiteConfig, GuestItem, SidePhotoItem } from '@/types';

// Bộ ảnh giả lập kỷ niệm thời sinh viên dùng để test hiệu ứng chạy quanh thư
// Khi người dùng thêm ảnh thật vào hệ thống, các ảnh thật này sẽ được ưu tiên hiển thị ngay lập tức
const DEMO_SIDE_PHOTOS_TOP: SidePhotoItem[] = [
  { id: 'demo-top-1', src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', rotate: -3 },
  { id: 'demo-top-2', src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80', rotate: 4 },
  { id: 'demo-top-3', src: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600&auto=format&fit=crop&q=80', rotate: -2 },
  { id: 'demo-top-4', src: 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=600&auto=format&fit=crop&q=80', rotate: 5 },
  { id: 'demo-top-5', src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80', rotate: -4 },
  { id: 'demo-top-6', src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80', rotate: 3 },
];

const DEMO_SIDE_PHOTOS_BOTTOM: SidePhotoItem[] = [
  { id: 'demo-bot-1', src: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80', rotate: -3 },
  { id: 'demo-bot-2', src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80', rotate: 4 },
  { id: 'demo-bot-3', src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80', rotate: -5 },
  { id: 'demo-bot-4', src: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&auto=format&fit=crop&q=80', rotate: 2 },
  { id: 'demo-bot-5', src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80', rotate: -2 },
  { id: 'demo-bot-6', src: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=600&auto=format&fit=crop&q=80', rotate: 3 },
];

// Hàm chuẩn hóa link ảnh nếu là link raw.githubusercontent của repo thì trỏ về /uploads để chạy mượt
const normalizePhotoSrc = (src: string) => {
  if (!src) return '';
  const rawPrefix = 'https://raw.githubusercontent.com/TriNguyen2808/thiep-tot-nghiep/main/public';
  if (src.startsWith(rawPrefix)) {
    return src.replace(rawPrefix, '');
  }
  return src;
};

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
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Kiểm tra trạng thái đã xác nhận tham dự
  useEffect(() => {
    try {
      const confirmKey = guestName ? `tri_confirmed_${guestName.trim()}` : 'tri_confirmed_guest';
      if (localStorage.getItem(confirmKey) || localStorage.getItem('tri_invitation_confirmed')) {
        setHasConfirmed(true);
      }
    } catch (_) {}
  }, [guestName]);

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

  // Lấy danh sách ảnh từ cấu hình
  const rawLeft = (siteConfig?.sidePhotosLeft ?? []).filter((p) => p && p.src && p.src.trim() !== '');
  const rawRight = (siteConfig?.sidePhotosRight ?? []).filter((p) => p && p.src && p.src.trim() !== '');
  const allPhotos = [...rawLeft, ...rawRight];

  // Chia ảnh thành 2 dải chạy ngang: 1 dải trên thư và 1 dải dưới thư
  let topPhotos: SidePhotoItem[] = [];
  let bottomPhotos: SidePhotoItem[] = [];

  if (allPhotos.length > 0) {
    if (rawLeft.length > 0 && rawRight.length > 0) {
      topPhotos = rawLeft;
      bottomPhotos = rawRight;
    } else {
      const half = Math.ceil(allPhotos.length / 2);
      topPhotos = allPhotos.slice(0, half);
      bottomPhotos = allPhotos.slice(half);
      if (bottomPhotos.length === 0 && topPhotos.length > 0) {
        bottomPhotos = topPhotos;
      }
    }
  } else {
    // Nếu chưa có ảnh thật, dùng bộ ảnh giả lập để người dùng xem trước hiệu ứng chuyển động
    // Khi thêm ảnh thật, hệ thống sẽ lập tức chuyển sang ảnh thật
    topPhotos = DEMO_SIDE_PHOTOS_TOP;
    bottomPhotos = DEMO_SIDE_PHOTOS_BOTTOM;
  }

  // Nhân bản danh sách ảnh để cuộn vô tận mượt mà, không bị ngắt quãng
  const prepareMarquee = (items: SidePhotoItem[]) => {
    if (items.length === 0) return [];
    let list = [...items];
    while (list.length < 6) {
      list = [...list, ...items];
    }
    return [...list, ...list];
  };

  const displayTopPhotos = prepareMarquee(topPhotos);
  const displayBottomPhotos = prepareMarquee(bottomPhotos);

  const handleScrollToGuestbook = () => {
    const el = document.getElementById('guestbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen max-w-6xl mx-auto px-2 sm:px-4 py-8 md:py-14 flex flex-col items-center justify-center gap-6 sm:gap-8 overflow-hidden"
    >
      {/* Vệt sáng spotlight từ trên chiếu xuống lá thư */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-96 bg-gradient-to-b from-white/35 via-white/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* ================= 1. DẢI ẢNH CHẠY NGANG CHẬM RÃI PHÍA TRÊN THƯ ================= */}
      {topPhotos.length > 0 && (
        <div className="relative w-full max-w-5xl overflow-hidden py-1.5 select-none z-10">
          {/* Mờ dần 2 bên mép để ảnh ra vào mềm mại */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#6EC2F7] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#6EC2F7] to-transparent z-10" />

          <motion.div
            className="flex items-center gap-3 sm:gap-4 w-max"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              ease: 'linear',
              duration: Math.max(35, topPhotos.length * 4),
              repeat: Infinity,
            }}
          >
            {displayTopPhotos.map((photo, idx) => {
              const tilt = (idx % 2 === 0 ? -1 : 1) * (1.5 + (idx % 3));
              return (
                <motion.div
                  key={`top-marq-${photo.id || idx}-${idx}`}
                  whileHover={{ scale: 1.08, zIndex: 20 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoomedPhoto(normalizePhotoSrc(photo.src))}
                  style={{ transform: `rotate(${tilt}deg)` }}
                  className="w-24 xs:w-28 sm:w-36 md:w-40 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-md border-2 border-white/90 flex-shrink-0 cursor-pointer bg-slate-800 transition-transform"
                  title="Bấm để phóng to xem ảnh"
                >
                  <img
                    src={normalizePhotoSrc(photo.src)}
                    alt="Kỷ niệm Trí Nguyễn"
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEMO_SIDE_PHOTOS_TOP[idx % DEMO_SIDE_PHOTOS_TOP.length].src;
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* ================= 2. THIỆP MỜI CHÍNH Ở GIỮA ================= */}
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
                  src={normalizePhotoSrc(displayLetterImage)}
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
                className={`py-2 sm:py-2.5 px-3 rounded-xl font-serif text-xs sm:text-sm font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  hasConfirmed 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-navy-900 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{hasConfirmed ? 'Đã Confirm' : 'Confirm'}</span>
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

      {/* ================= 3. DẢI ẢNH CHẠY NGANG CHẬM RÃI PHÍA DƯỚI THƯ ================= */}
      {bottomPhotos.length > 0 && (
        <div className="relative w-full max-w-5xl overflow-hidden py-1.5 select-none z-10">
          {/* Mờ dần 2 bên mép để ảnh ra vào mềm mại */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#6EC2F7] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#6EC2F7] to-transparent z-10" />

          <motion.div
            className="flex items-center gap-3 sm:gap-4 w-max"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              ease: 'linear',
              duration: Math.max(35, bottomPhotos.length * 4),
              repeat: Infinity,
            }}
          >
            {displayBottomPhotos.map((photo, idx) => {
              const tilt = (idx % 2 === 0 ? 1 : -1) * (1.5 + (idx % 3));
              return (
                <motion.div
                  key={`bot-marq-${photo.id || idx}-${idx}`}
                  whileHover={{ scale: 1.08, zIndex: 20 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setZoomedPhoto(normalizePhotoSrc(photo.src))}
                  style={{ transform: `rotate(${tilt}deg)` }}
                  className="w-24 xs:w-28 sm:w-36 md:w-40 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-md border-2 border-white/90 flex-shrink-0 cursor-pointer bg-slate-800 transition-transform"
                  title="Bấm để phóng to xem ảnh"
                >
                  <img
                    src={normalizePhotoSrc(photo.src)}
                    alt="Kỷ niệm Trí Nguyễn"
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEMO_SIDE_PHOTOS_BOTTOM[idx % DEMO_SIDE_PHOTOS_BOTTOM.length].src;
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

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
