'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, X, ChevronLeft, ChevronRight, Layers, ZoomIn 
} from 'lucide-react';
import { PHOTO_COLLECTIONS } from '@/data/initialData';
import { CollectionItem } from '@/types';

interface GallerySectionProps {
  collections?: CollectionItem[];
}

export default function GallerySection({ collections }: GallerySectionProps) {
  const displayCollections = collections && collections.length > 0 ? collections : PHOTO_COLLECTIONS;
  const [activeCollection, setActiveCollection] = useState<CollectionItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleOpenCollection = (col: CollectionItem) => {
    setActiveCollection(col);
    setCurrentPhotoIndex(0);
  };

  const handleClose = () => {
    setActiveCollection(null);
  };

  const handleNextPhoto = () => {
    if (!activeCollection) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % activeCollection.images.length);
  };

  const handlePrevPhoto = () => {
    if (!activeCollection) return;
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? activeCollection.images.length - 1 : prev - 1
    );
  };

  return (
    <section id="gallery" className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 py-10 md:py-16">
      {/* Tiêu đề mục Bộ sưu tập trên nền #6EC2F7 */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27A4F2] text-white border border-white/30 text-[11px] sm:text-xs font-mono uppercase tracking-widest mb-2 shadow-md">
          <Camera className="w-3.5 h-3.5 text-white" />
          Kỷ Niệm Thanh Xuân • Photo Album
        </div>
        <h2 className="font-serif text-[13px] sm:text-3xl md:text-4xl font-extrabold text-[#061C38] tracking-tight drop-shadow-sm whitespace-nowrap">
          BỘ SƯU TẬP KHOẢNH KHẮC ĐẸP TẠI TRƯỜNG
        </h2>
        <p className="mt-1.5 text-navy-950 font-sans text-xs sm:text-sm max-w-lg mx-auto font-medium">
          Từng góc sân trường, từng buổi hoàng hôn và những kỷ niệm khó quên trong 4 năm đại học.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#061C38] to-transparent mx-auto mt-2 rounded-full" />
      </div>

      {/* Grid các ô Bộ sưu tập: XEM ĐƯỢC 2 BỘ SƯU TẬP TRÊN 1 DÒNG KHI XEM BẰNG ĐIỆN THOẠI (grid-cols-2) */}
      {displayCollections.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm max-w-lg mx-auto">
          <Camera className="w-12 h-12 text-[#27A4F2] mx-auto mb-3 opacity-60" />
          <p className="text-slate-700 font-medium text-sm">
            Bộ sưu tập ảnh kỷ niệm đang được cập nhật. Bạn hãy quay lại sau nhé! 📸✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3.5 sm:gap-6">
          {displayCollections.map((col, idx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => handleOpenCollection(col)}
              className="polaroid-card cursor-pointer group relative flex flex-col justify-between border border-slate-200/90 !p-2 !pb-3 sm:!p-3 sm:!pb-5 rounded-lg"
              style={{
                transform: `rotate(${idx % 2 === 0 ? -1.2 : 1.2}deg)`,
              }}
            >
              {/* Washi Tape Y2K dán trên đầu card */}
              <div
                className={`washi-tape -top-2 ${
                  idx % 2 === 0 ? 'left-2 -rotate-6' : 'right-2 rotate-6 washi-tape-blue'
                } !w-16 sm:!w-20 !h-4 text-[7px] sm:text-[8px] font-bold text-navy-950 flex items-center justify-center uppercase tracking-tighter`}
              >
                ★ ALBUM 0{idx + 1} ★
              </div>

              {/* 1 Ảnh đại diện của Bộ sưu tập */}
              <div className="relative aspect-[4/5] rounded overflow-hidden bg-slate-100 mb-2">
                <img
                  src={col.coverImage}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[7.5px] sm:text-[9px] font-mono font-bold bg-[#27A4F2] text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
                    {col.badge}
                  </span>
                </div>

                {/* Nút xem chi tiết khi hover */}
                <div className="absolute inset-0 bg-navy-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-white text-navy-950 font-bold text-[10px] sm:text-xs shadow-md flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Mở {col.images.length} Ảnh
                  </span>
                </div>

                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[8px] sm:text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">
                  <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{col.images.length}</span>
                </div>
              </div>

              {/* Tiêu đề thể hiện cho Bộ sưu tập */}
              <div className="text-center pt-1 border-t border-slate-100">
                <h3 className="font-serif text-xs sm:text-sm font-bold text-navy-950 line-clamp-2 leading-tight">
                  {col.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL CỬA SỔ CÁC ẢNH TRONG BỘ SƯU TẬP (LIGHTBOX) */}
      <AnimatePresence>
        {activeCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors z-20 cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-3 pr-10">
                <span className="text-[10px] font-mono text-navy-900 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded">
                  {activeCollection.badge}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-950 mt-1">
                  {activeCollection.title}
                </h3>
              </div>

              {/* Vùng hiển thị ảnh chính */}
              <div className="relative flex-1 min-h-[260px] sm:min-h-[380px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPhotoIndex}
                    src={activeCollection.images[currentPhotoIndex]?.url}
                    alt={activeCollection.images[currentPhotoIndex]?.caption}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.25 }}
                    className="max-h-[55vh] max-w-full object-contain rounded"
                  />
                </AnimatePresence>

                {activeCollection.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-white hover:text-navy-950 text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-white hover:text-navy-950 text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-sm p-2 rounded-xl text-center">
                  <p className="text-xs text-white font-serif italic">
                    &ldquo;{activeCollection.images[currentPhotoIndex]?.caption}&rdquo;
                  </p>
                  <span className="text-[10px] font-mono text-amber-400 mt-0.5 block">
                    {currentPhotoIndex + 1} / {activeCollection.images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail Bar */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {activeCollection.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={`relative w-14 h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      i === currentPhotoIndex ? 'border-navy-900 scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
