'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Send, Upload, X, Check, AlertCircle, 
  Sparkles, CheckCircle2, ChevronLeft, ChevronRight, Bookmark, 
  Share2, Camera, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '@/lib/sound';
import { Wish } from '@/types';
import { INITIAL_WISHES } from '@/data/initialData';

interface GuestbookSectionProps {
  guestName?: string;
}

export default function GuestbookSection({ guestName = '' }: GuestbookSectionProps) {
  const [wishes, setWishes] = useState<Wish[]>(INITIAL_WISHES);
  const [formData, setFormData] = useState({
    name: '',
    attendance: 'yes' as 'yes' | 'no' | 'maybe',
    message: '',
    isPublic: true,
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chỉ số ảnh của từng bài viết trong feed (nếu có nhiều ảnh)
  const [postPhotoIndexes, setPostPhotoIndexes] = useState<{ [wishId: string]: number }>({});

  useEffect(() => {
    const isNotDummyWish = (w: Wish) => !['wish-1', 'wish-2', 'wish-3', 'wish-4', '1', '2', '3', '4'].includes(w.id);

    const fetchWishes = async () => {
      try {
        const res = await fetch('/api/wishes');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const validServerData = json.data.filter(isNotDummyWish);
          const localStored = localStorage.getItem('tri_graduation_wishes');
          if (localStored) {
            try {
              const parsed = JSON.parse(localStored);
              if (Array.isArray(parsed)) {
                const validLocal = parsed.filter(isNotDummyWish);
                const combined = [...validLocal, ...validServerData];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                setWishes(unique);
                return;
              }
            } catch (e) {
              console.error(e);
            }
          }
          setWishes(validServerData);
        }
      } catch (err) {
        const localStored = localStorage.getItem('tri_graduation_wishes');
        if (localStored) {
          try {
            const parsed = JSON.parse(localStored);
            if (Array.isArray(parsed)) {
              setWishes(parsed.filter(isNotDummyWish));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    fetchWishes();
  }, []);

  // Nén ảnh client-side trước khi đưa vào form để không vượt quá giới hạn 4.5MB của Vercel
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800; // Giới hạn kích thước tối đa 800px cho ảnh lưu bút
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const remainingSlots = 5 - selectedImages.length;
      if (remainingSlots <= 0) return;

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const compressedList: string[] = [];

      for (const file of filesToProcess) {
        const compressed = await compressImageFile(file);
        compressedList.push(compressed);
      }

      setSelectedImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.warn('Lỗi xử lý ảnh:', err);
    } finally {
      setIsProcessingPhotos(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Không bắt buộc nhập biệt danh, nếu để trống sẽ tự lấy tên khách
    if (!formData.message.trim()) {
      setErrorMessage('Hãy gửi gắm một vài dòng lời chúc tới Trí nhé!');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMessage('');

    // Ưu tiên biệt danh khách tự nhập -> nếu để trống thì lấy tên khách trong dữ liệu -> fallback "Bạn Thân Mến"
    const resolvedName = formData.name.trim() || guestName?.trim() || 'Bạn Thân Mến';
    const finalName = formData.isPublic 
      ? resolvedName 
      : 'Một người bạn ẩn danh 🤫';

    const payload = {
      name: finalName,
      attendance: formData.attendance,
      message: formData.message,
      images: selectedImages,
      isPublic: formData.isPublic,
    };

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMessage = `Lỗi máy chủ (${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson.error) errMessage = errJson.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      let newWishItem: Wish;

      if (json.success && json.data) {
        newWishItem = json.data;
      } else {
        newWishItem = {
          id: `wish-${Date.now()}`,
          name: finalName,
          attendance: formData.attendance,
          message: formData.message,
          images: selectedImages,
          isPublic: formData.isPublic,
          likes: 0,
          createdAt: new Date().toISOString(),
        };
      }

      const updated = [newWishItem, ...wishes];
      setWishes(updated);

      try {
        localStorage.setItem('tri_graduation_wishes', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }

      setFormData({
        name: '',
        attendance: 'yes',
        message: '',
        isPublic: true,
      });
      setSelectedImages([]);
      setSubmitSuccess(true);
      soundFX.playCelebration();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0B192C', '#C59B27', '#ffffff', '#FF70A6'],
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      // Vẫn lưu vào máy khách để trải nghiệm người dùng không bị mất lời chúc
      const fallbackItem: Wish = {
        id: `wish-${Date.now()}`,
        name: finalName,
        attendance: formData.attendance,
        message: formData.message,
        images: selectedImages,
        isPublic: formData.isPublic,
        likes: 0,
        createdAt: new Date().toISOString(),
      };
      const updated = [fallbackItem, ...wishes];
      setWishes(updated);
      try {
        localStorage.setItem('tri_graduation_wishes', JSON.stringify(updated));
      } catch (_) {}

      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ. Lời chúc đã được lưu cục bộ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeWish = async (id: string) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: (w.likes || 0) + 1 } : w))
    );
    soundFX.playCelebration();

    try {
      await fetch('/api/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextPhoto = (wishId: string, total: number) => {
    setPostPhotoIndexes((prev) => ({
      ...prev,
      [wishId]: ((prev[wishId] || 0) + 1) % total,
    }));
  };

  const handlePrevPhoto = (wishId: string, total: number) => {
    setPostPhotoIndexes((prev) => ({
      ...prev,
      [wishId]: (prev[wishId] || 0) === 0 ? total - 1 : (prev[wishId] || 0) - 1,
    }));
  };

  const getAttendanceLabel = (att: string) => {
    switch (att) {
      case 'yes':
        return { text: 'Tham Gia 100% 🎓', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'no':
        return { text: 'Tiếc quá bận rồi 🥺', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'maybe':
        return { text: 'Sẽ cố gắng ghé 💐', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { text: 'Khách Quý', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <section id="guestbook" className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 py-12 md:py-16">
      {/* Tiêu đề mục Gửi Lời Chúc trên nền #6EC2F7 */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27A4F2] text-white border border-white/30 text-xs font-mono uppercase tracking-widest mb-2 shadow-md">
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          Lưu Bút Tốt Nghiệp • Guestbook
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#061C38] tracking-tight drop-shadow-sm">
          GỬI LỜI CHÚC & KHOẢNH KHẮC KỶ NIỆM
        </h2>
        <p className="mt-1.5 text-navy-950 font-sans text-xs sm:text-sm max-w-lg mx-auto font-medium">
          Mỗi lời chúc và bức ảnh của bạn là món quà ý nghĩa nhất dành cho Trí trong ngày tốt nghiệp.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#061C38] to-transparent mx-auto mt-2 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= FORM BÊN TRÁI: GỬI LỜI CHÚC (5 CỘT) ================= */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xl relative">
          <div className="washi-tape -top-2.5 left-6 rotate-[-2deg] text-[8px] font-bold text-navy-950 flex items-center justify-center">
            ★ SỔ LƯU BÚT ★
          </div>

          <h3 className="font-serif text-xl font-bold text-navy-950 mb-1 flex items-center gap-2">
            Để Lại Lời Chúc Cho Trí
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Hãy chia sẻ cảm xúc, kỉ niệm hoặc gửi kèm ảnh chụp chung cùng Trí nhé!
          </p>

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Cảm ơn bạn! Lời chúc của bạn đã xuất hiện trên bảng Instagram bên cạnh 🎉</span>
            </motion.div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePreSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Bạn Có Thể Tham Dự Không?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'yes', label: 'Tham gia' },
                  { value: 'maybe', label: 'Cố gắng' },
                  { value: 'no', label: 'Bận rồi' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, attendance: item.value as any })}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center cursor-pointer ${
                      formData.attendance === item.value
                        ? 'bg-[#27A4F2] text-white font-bold border-[#27A4F2] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                Lời Chúc Dành Cho Trí <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Chúc Trí tốt nghiệp thật rực rỡ, thành công trên con đường sắp tới..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#27A4F2] text-sm resize-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase text-slate-600">
                  Ảnh Kỷ Niệm Cùng Trí (Tùy chọn)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{selectedImages.length}/5 ảnh</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={isProcessingPhotos}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#27A4F2] bg-slate-50 text-slate-600 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                <Camera className="w-4 h-4 text-[#27A4F2]" />
                <span>{isProcessingPhotos ? 'Đang tối ưu hóa dung lượng ảnh...' : 'Bấm để tải ảnh lên (Tối đa 5 ảnh)'}</span>
              </button>

              {selectedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedImages.map((img, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-300 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ô TICK "CHO PHÉP MỌI NGƯỜI THẤY" (MẶC ĐỊNH CHỌN) & NHẬP BIỆT DANH */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#27A4F2] focus:ring-[#27A4F2] cursor-pointer"
                />
                <div className="text-xs text-slate-700 leading-snug">
                  <span className="font-semibold text-navy-950">
                    Cho phép mọi người thấy
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {formData.isPublic 
                      ? '✓ Hiển thị lời chúc và ảnh kỷ niệm trên bảng tin' 
                      : '🔒 Gửi ẩn danh (Một người bạn ẩn danh 🤫)'}
                  </p>
                </div>
              </label>

              {/* Khi tick ô cho phép mọi người thấy -> Hiện ô nhập biệt danh (Tùy chọn) */}
              {formData.isPublic && (
                <div className="pl-6.5 pt-0.5">
                  <label className="block text-[11px] font-mono uppercase text-slate-600 mb-1">
                    Biệt Danh Của Bạn <span className="text-slate-400 font-normal lowercase">(tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={guestName ? `Để trống sẽ lấy tên: "${guestName}"` : "Ví dụ: Bạn thân nối khố, Linh Cún..."}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#27A4F2] text-xs sm:text-sm"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {guestName 
                      ? `💡 Không bắt buộc. Nếu để trống, lời chúc sẽ hiển thị tên "${guestName}".` 
                      : '💡 Không bắt buộc nhập. Bạn có thể để trống hoặc đặt biệt danh gần gũi.'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-2xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-bold font-sans text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Lời Chúc Tới Trí</span>
            </button>
          </form>
        </div>

        {/* ================= BÊN PHẢI: KHUNG MÔ PHỎNG MÀN HÌNH ĐIỆN THOẠI - LƯỚT XUỐNG XEM CÁC BÀI ĐĂNG INSTAGRAM ================= */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          {/* KHUNG MÔ PHỎNG MÀN HÌNH ĐIỆN THOẠI (PHONE SCREEN CONTAINER) - TĂNG KÍCH THƯỚC */}
          <div className="w-full max-w-[500px] bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Top Bar Mô Phỏng App Instagram */}
            <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-black text-xl text-navy-950 tracking-tight">
                  Feed lời chúc của mọi người nè 
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                <Send className="w-5 h-5 -rotate-45 hover:text-navy-900 cursor-pointer transition-colors" />
              </div>
            </div>

            {/* KHU VỰC CUỘN DỌC: KHÁCH LƯỚT XUỐNG XEM TẤT CẢ CÁC BÀI ĐĂNG (VERTICAL SCROLL FEED) - TĂNG CHIỀU CAO */}
            <div 
              className="overflow-y-auto max-h-[700px] divide-y divide-slate-100 bg-[#fafafa]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent',
              }}
            >
              {wishes.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-500 font-serif italic text-xs sm:text-sm bg-white">
                  Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tốt đẹp đến Trí Nguyễn nhé! ✨
                </div>
              ) : (
                wishes.map((wish) => {
                  const photoIdx = postPhotoIndexes[wish.id] || 0;
                  const hasPhotos = wish.images && wish.images.length > 0;
                  const attLabel = getAttendanceLabel(wish.attendance);

                  return (
                    <article key={wish.id} className="bg-white mb-3 first:mt-0 last:mb-0 shadow-sm border-b border-slate-100">
                    {/* Header bài đăng */}
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-navy-950 font-bold text-xs">
                            {wish.name.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-sans font-bold text-xs text-navy-950">
                              {wish.name}
                            </h4>
                            {wish.isPublic && (
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[6px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {new Date(wish.createdAt).toLocaleDateString('vi-VN')} • Graduation Day
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${attLabel.bg}`}>
                        {attLabel.text}
                      </span>
                    </div>

                    {/* Ảnh bài đăng (vuông chuẩn Instagram) */}
                    {hasPhotos ? (
                      <div className="relative aspect-square bg-slate-900 overflow-hidden flex items-center justify-center">
                        <img
                          src={wish.images[photoIdx]}
                          alt="Ảnh kỷ niệm"
                          className="w-full h-full object-cover"
                        />

                        {wish.images.length > 1 && (
                          <>
                            <button
                              onClick={() => handlePrevPhoto(wish.id, wish.images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleNextPhoto(wish.id, wish.images.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                              {wish.images.map((_, dotIdx) => (
                                <div
                                  key={dotIdx}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    dotIdx === photoIdx ? 'bg-amber-400 w-3' : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}

                    {/* Action Bar */}
                    <div className="px-3.5 pt-2.5 pb-1 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <button
                          onClick={() => handleLikeWish(wish.id)}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-red-500 transition-colors cursor-pointer group"
                        >
                          <Heart className="w-5 h-5 group-hover:scale-125 transition-transform group-hover:text-red-500 group-hover:fill-red-500" />
                          <span className="text-xs font-mono font-bold">{wish.likes || 0}</span>
                        </button>
                        <MessageCircle className="w-5 h-5 text-slate-600 hover:text-navy-900 cursor-pointer" />
                        <Share2 className="w-5 h-5 text-slate-600 hover:text-navy-900 cursor-pointer" />
                      </div>
                      <Bookmark className="w-5 h-5 text-slate-400" />
                    </div>

                    {/* Caption lời chúc */}
                    <div className="px-3.5 pb-3 pt-1 text-xs text-slate-800">
                      <p className="leading-relaxed">
                        <span className="font-bold text-navy-950 mr-1.5">{wish.name}</span>
                        {wish.message}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] font-mono text-navy-800">
                        <span>#Graduation2026</span>
                        <span>#TriNguyen</span>
                        <span>#ThanhXuan</span>
                      </div>
                    </div>
                  </article>
                );
              }))}
            </div>

            {/* Chỉ dẫn cuộn dưới chân khung */}
            <div className="bg-white py-2 border-t border-slate-100 text-center text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <span>↓ Cuộn xuống để xem thêm các lời chúc khác</span>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP XÁC NHẬN TRƯỚC KHI GỬI */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-2xl text-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">
                Xác Nhận Gửi Lời Chúc?
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Bạn có chắc chắn muốn gửi lời chúc này đến <span className="font-bold text-navy-900">Trí Nguyễn</span> không?
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Kiểm tra lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Đồng Ý Gửi</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
