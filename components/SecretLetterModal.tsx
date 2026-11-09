'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Clock, Camera } from 'lucide-react';
import { soundFX } from '@/lib/sound';

interface SecretLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  customLetterText?: string;
}

export default function SecretLetterModal({ 
  isOpen, 
  onClose, 
  guestName, 
  customLetterText 
}: SecretLetterModalProps) {
  useEffect(() => {
    if (isOpen) {
      soundFX.playOpenLetter();
    }
  }, [isOpen]);

  const handleClose = () => {
    soundFX.playCloseLetter();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          {/* Toàn bộ lá thư xuất hiện vừa vặn trong khung hình */}
          <motion.div
            initial={{ scale: 0.88, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl bg-white text-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-400/80 my-auto overflow-hidden"
            style={{
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 20px rgba(197, 155, 39, 0.15)',
            }}
          >
            {/* Washi Tape Y2K */}
            <div className="washi-tape -top-2 left-6 rotate-[-5deg] text-[8px] font-bold text-navy-950 flex items-center justify-center">
              TOP SECRET
            </div>
            <div className="washi-tape -top-2 right-10 rotate-[6deg] bg-navy-600/30 text-[8px] font-bold text-navy-950 flex items-center justify-center">
              DÀNH RIÊNG CHO BẠN
            </div>

            {/* Nút Đóng */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors z-20 cursor-pointer"
              title="Đóng thư"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Thư Bí Mật */}
            <div className="border-b border-slate-200 pb-3 mb-4 text-center">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-900 text-amber-300 text-[10px] font-mono uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Thư Gửi Từ Trái Tim
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950">
                Gửi Người Bạn Đặc Biệt Của Trí
              </h3>

              {/* Thời gian viết thư */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-serif italic mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Đêm muộn trước thềm tốt nghiệp • 23:45 PM</span>
              </div>
            </div>

            {/* Nội dung tâm sự bức thư súc tích, trọn vẹn */}
            <div className="space-y-2.5 font-serif text-slate-700 text-xs sm:text-sm leading-relaxed text-justify px-1">
              <p>
                Chào <span className="font-bold text-navy-900 underline decoration-amber-400 decoration-2">{guestName || 'bạn của Trí'}</span>,
              </p>
              {customLetterText ? (
                <div className="whitespace-pre-line text-slate-800 leading-relaxed">
                  {customLetterText}
                </div>
              ) : (
                <>
                  <p>
                    Những năm tháng đại học trôi qua nhanh như một cái chớp mắt. Cảm ơn bạn vì đã luôn ở đó, lắng nghe những trăn trở, động viên Trí trong những giai đoạn khó khăn nhất và cùng Trí tạo nên những mảnh ký ức rực rỡ không thể thay thế.
                  </p>
                  <p className="font-semibold text-navy-900 italic">
                    Sự có mặt của bạn trong ngày nhận bằng cử nhân chính là món quà vô giá nhất đối với Trí. Cùng nhau chụp thật nhiều ảnh nhé! ❤️
                  </p>
                </>
              )}
            </div>

            {/* 2 Khung ảnh kỷ niệm gọn gàng Y2K */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {/* Ảnh Kỷ Niệm 1 */}
                <div className="polaroid-card -rotate-1 relative border border-slate-200 !p-1.5 !pb-3">
                  <div className="aspect-[4/3] rounded overflow-hidden bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80"
                      alt="Khoảnh khắc 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1 text-center font-cursive text-xs text-navy-900">
                    Thanh xuân rực rỡ
                  </p>
                </div>

                {/* Ảnh Kỷ Niệm 2 */}
                <div className="polaroid-card rotate-1 relative border border-slate-200 !p-1.5 !pb-3">
                  <div className="aspect-[4/3] rounded overflow-hidden bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80"
                      alt="Khoảnh khắc 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1 text-center font-cursive text-xs text-navy-900">
                    Mãi là bạn tốt
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Thư: Chữ ký & Nút Gấp Thư */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200">
              <div>
                <span className="font-cursive text-xl text-navy-950 font-bold">Trí Nguyễn</span>
              </div>

              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-1.5 rounded-full bg-navy-900 text-amber-300 font-sans font-semibold text-xs hover:bg-navy-800 transition-colors shadow cursor-pointer flex items-center gap-1.5 border border-amber-400/40"
              >
                <span>Gấp Thư Lại</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
