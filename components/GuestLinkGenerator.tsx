'use client';

import React, { useState } from 'react';
import { Link2, Copy, Check, Share2, Sparkles, X } from 'lucide-react';

export default function GuestLinkGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSecret, setIsSecret] = useState(false);

  const getGeneratedUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanName = recipient.trim().replace(/\s+/g, '_');
    if (!cleanName) return baseUrl;

    let url = `${baseUrl}?to=${encodeURIComponent(cleanName)}`;
    if (isSecret) {
      url += '&secret=1';
    }
    return url;
  };

  const copyToClipboard = () => {
    const url = getGeneratedUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <>
      {/* Floating Tool Button ở góc trái dưới */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-navy-900/90 border border-gold/40 text-gold text-xs font-mono backdrop-blur-md shadow-xl hover:bg-navy-800 transition-colors cursor-pointer"
        title="Tạo link mời riêng cho từng bạn bè"
      >
        <Link2 className="w-4 h-4 text-gold" />
        <span className="hidden sm:inline">Tạo Link Mời Riêng</span>
      </button>

      {/* Modal Popup Tạo Link Mời */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md bg-navy-950 border-2 border-gold/60 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-gold text-xs font-mono uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              Công Cụ Tạo Link Mời Nhanh
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">
              Gửi Thiệp Cho Bạn Bè
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Nhập tên người bạn muốn gửi, hệ thống sẽ tự động tạo đường link cá nhân hóa chứa tên bạn ấy trên thiệp mời!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Tên Khách Mời / Bạn Bè
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh, Thảo My, Thầy Cô..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="rounded text-gold focus:ring-gold bg-navy-900"
                />
                <span>Tự động mở Thư Bí Mật khi người này truy cập (Dành cho người đặc biệt)</span>
              </label>

              {/* Ô hiển thị Link */}
              <div className="bg-navy-900/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-gold truncate">
                  {getGeneratedUrl() || 'Vui lòng nhập tên...'}
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-gold text-navy-950 font-bold hover:bg-yellow-400 transition-colors flex-shrink-0 cursor-pointer"
                  title="Sao chép link"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {isCopied && (
                <p className="text-xs text-emerald-400 font-mono text-center animate-pulse">
                  ✓ Đã sao chép link vào clipboard! Bạn có thể gửi ngay qua Zalo/Messenger.
                </p>
              )}

              {/* Lối tắt vào trang Quản trị Admin */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Dành riêng cho Trí:</span>
                <a
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-mono font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trang Quản Trị Hệ Thống →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

