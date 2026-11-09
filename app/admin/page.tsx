'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Save, Plus, Trash2, Copy, Check, ArrowLeft, 
  Upload, Image as ImageIcon, Users, MapPin, Phone, 
  Car, Layers, MessageSquare, Camera, Sparkles, AlertCircle, RefreshCw, 
  Download, FileSpreadsheet, X, Eye, Key
} from 'lucide-react';
import { SiteConfig, ContactPerson, ParkingLocation, CollectionItem, SidePhotoItem, GuestItem, Wish, CheckinPhoto } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'guests' | 'collections' | 'photos' | 'wishes' | 'checkins'>('info');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [checkins, setCheckins] = useState<CheckinPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Import Excel/CSV cho Khách Mời
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPasteText, setImportPasteText] = useState('');
  const [parsedImportGuests, setParsedImportGuests] = useState<Omit<GuestItem, 'id' | 'createdAt'>[]>([]);

  // Token GitHub để lưu trực tiếp trên web Vercel
  const [githubToken, setGithubToken] = useState<string>('');
  const [tempTokenInput, setTempTokenInput] = useState<string>('');
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);

  // Load token và dữ liệu khi vào trang
  useEffect(() => {
    const savedToken = localStorage.getItem('tri_admin_github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      setTempTokenInput(savedToken);
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Load cấu hình trang
      const resConfig = await fetch('/api/admin/data');
      const jsonConfig = await resConfig.json();
      if (jsonConfig.success && jsonConfig.data) {
        setConfig(jsonConfig.data);
      }

      // 2. Load lời chúc
      const resWishes = await fetch('/api/wishes');
      const jsonWishes = await resWishes.json();
      if (jsonWishes.success && Array.isArray(jsonWishes.data)) {
        setWishes(jsonWishes.data);
      }

      // 3. Load ảnh check-in
      const resCheckins = await fetch('/api/checkin');
      const jsonCheckins = await resCheckins.json();
      if (jsonCheckins.success && Array.isArray(jsonCheckins.data)) {
        setCheckins(jsonCheckins.data);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      showStatus('Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Tự động nén ảnh thông minh trước khi tải lên (giúp ảnh sắc nét nhưng dung lượng nhỏ gọn, không bao giờ bị lỗi quá tải Vercel 4.5MB)
  const compressImageBeforeUpload = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/') || file.size < 350 * 1024) {
        return resolve(file);
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Helper hàm tải từng ảnh riêng lẻ (tránh lỗi Request Entity Too Large trên Vercel)
  const uploadFilesToServer = async (files: FileList | File[]): Promise<string[]> => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const rawFile = fileArray[i];
        // 1. Tự động nén ảnh tối ưu kích thước
        const fileToUpload = await compressImageBeforeUpload(rawFile);

        const formData = new FormData();
        formData.append('files', fileToUpload);

        const headers: Record<string, string> = {};
        if (githubToken) {
          headers['x-github-token'] = githubToken;
        }

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText.slice(0, 100) || `Lỗi tải ảnh (${res.status})`);
        }

        const json = await res.json();
        if (json.success && Array.isArray(json.urls) && json.urls.length > 0) {
          uploadedUrls.push(json.urls[0]);
        }
      }

      return uploadedUrls;
    } catch (err: any) {
      console.error('Upload error:', err);
      showStatus('Lỗi khi tải ảnh lên: ' + err.message, 'error');
      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveGitHubToken = (tokenValue: string) => {
    const clean = tokenValue.trim();
    setGithubToken(clean);
    setTempTokenInput(clean);
    if (clean) {
      localStorage.setItem('tri_admin_github_token', clean);
      showStatus('Đã kết nối GitHub Token! Bây giờ bạn có thể chỉnh sửa và bấm Lưu trực tiếp trên web Vercel.', 'success');
    } else {
      localStorage.removeItem('tri_admin_github_token');
      showStatus('Đã xóa GitHub Token.', 'success');
    }
    setShowTokenModal(false);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      // Luôn lưu bản sao vào localStorage của trình duyệt
      localStorage.setItem('tri_graduation_site_data', JSON.stringify(config));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (githubToken) {
        headers['x-github-token'] = githubToken;
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers,
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        if (json.isGitHubSaved) {
          showStatus(
            '🎉 Đã lưu và đồng bộ trực tiếp lên GitHub & Vercel thành công! Website đã được cập nhật cho toàn bộ khách mời.',
            'success'
          );
        } else if (json.isVercelReadOnly) {
          showStatus(
            'Đã lưu vào bộ nhớ tạm! Bạn hãy nhấn nút "Cài GitHub Token" ở góc trên để web tự động lưu vĩnh viễn nhé.',
            'success'
          );
        } else {
          showStatus('Đã lưu toàn bộ thông tin cấu hình thành công! Website đã được cập nhật.', 'success');
        }
      } else {
        showStatus(json.error || 'Có lỗi xảy ra khi lưu!', 'error');
      }
    } catch (err: any) {
      showStatus('Lỗi kết nối máy chủ: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Tải file siteData.json trực tiếp về máy tính
  const handleExportConfigJSON = () => {
    if (!config) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'siteData.json');
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showStatus('Đã tải file siteData.json về máy tính!', 'success');
  };

  // Quản lý lời chúc
  const handleDeleteWish = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lời chúc này?')) return;
    try {
      const res = await fetch(`/api/wishes?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
        showStatus('Đã xóa lời chúc thành công!', 'success');
      }
    } catch (err) {
      showStatus('Lỗi khi xóa lời chúc', 'error');
    }
  };

  // Quản lý ảnh check-in
  const handleDeleteCheckin = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh check-in này khỏi dự án?')) return;
    try {
      const res = await fetch(`/api/checkin?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setCheckins((prev) => prev.filter((c) => c.id !== id));
        showStatus('Đã xóa ảnh check-in thành công!', 'success');
      }
    } catch (err) {
      showStatus('Lỗi khi xóa ảnh check-in', 'error');
    }
  };

  // Copy link mời khách
  const handleCopyGuestLink = (guest: GuestItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const safeName = encodeURIComponent(guest.name.replace(/\s+/g, '_'));
    const link = `${origin}/?to=${safeName}&id=${guest.id}${guest.secretLetter ? '&secret=1' : ''}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2500);
    showStatus(`Đã sao chép link mời riêng cho "${guest.name}"!`, 'success');
  };

  // Tìm ID lớn nhất dạng số để tự tạo ID tăng dần
  const getNextGuestId = (currentGuests: GuestItem[]) => {
    if (!currentGuests || currentGuests.length === 0) return '1';
    let maxId = 0;
    for (const g of currentGuests) {
      const parsed = parseInt(g.id.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > maxId) {
        maxId = parsed;
      }
    }
    return String(maxId + 1);
  };

  // Thêm một khách mới với ID số tăng dần tự động
  const handleAddNewGuest = () => {
    if (!config) return;
    const nextId = getNextGuestId(config.guests);
    const newGuest: GuestItem = {
      id: nextId,
      name: '',
      secretLetter: '',
      customLetterImage: '',
      note: '',
      createdAt: new Date().toISOString(),
    };
    setConfig({ ...config, guests: [newGuest, ...config.guests] });
    showStatus(`Đã tạo khách mời mới với ID số ${nextId}!`, 'success');
  };

  // Xử lý phân tích dữ liệu CSV hoặc Paste từ Excel
  const parseGuestData = (rawText: string) => {
    const lines = rawText.trim().split(/\r?\n/);
    const parsedList: Omit<GuestItem, 'id' | 'createdAt'>[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Nhận diện phân tách theo Tab (Excel Copy-Paste) hoặc Dấu Phẩy (CSV) hoặc Dấu Chấm Phẩy
      let parts: string[] = [];
      if (trimmed.includes('\t')) {
        parts = trimmed.split('\t');
      } else if (trimmed.includes(';')) {
        parts = trimmed.split(';');
      } else {
        parts = trimmed.split(',');
      }

      const cleanParts = parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const name = cleanParts[0] || '';

      // Bỏ qua dòng tiêu đề nếu người dùng copy cả header
      const lower = name.toLowerCase();
      if (lower === 'tên' || lower === 'tên khách' || lower === 'tên khách mời' || lower === 'name') {
        continue;
      }

      if (name) {
        parsedList.push({
          name,
          secretLetter: cleanParts[1] || '',
          customLetterImage: cleanParts[2] || '',
          note: cleanParts[3] || '',
        });
      }
    }

    setParsedImportGuests(parsedList);
  };

  // Đọc file CSV / Excel được chọn
  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportPasteText(text);
        parseGuestData(text);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Xác nhận import danh sách khách vào config
  const handleConfirmImportGuests = () => {
    if (!config || parsedImportGuests.length === 0) return;

    let currentMax = parseInt(getNextGuestId(config.guests), 10) - 1;
    const newItems: GuestItem[] = parsedImportGuests.map((item) => {
      currentMax += 1;
      return {
        id: String(currentMax),
        name: item.name,
        secretLetter: item.secretLetter || '',
        customLetterImage: item.customLetterImage || '',
        note: item.note || '',
        createdAt: new Date().toISOString(),
      };
    });

    setConfig({
      ...config,
      guests: [...config.guests, ...newItems],
    });

    setShowImportModal(false);
    setImportPasteText('');
    setParsedImportGuests([]);
    showStatus(`Đã nhập thành công ${newItems.length} khách mời mới với ID tăng dần! Nhớ bấm 'LƯU TẤT CẢ'.`, 'success');
  };

  // Tải file mẫu CSV
  const handleDownloadSampleCSV = () => {
    const sample = 'Tên Khách Mời,Thư Bí Mật,Ảnh Đầu Thư Riêng,Ghi Chú\nNguyễn Văn A,"Cảm ơn bạn đã luôn đồng hành cùng tôi suốt 4 năm đại học!",https://example.com/anh1.jpg,Bạn thân cấp 3\nTrần Thị B,"Rất vui được gặp cậu trong ngày tốt nghiệp!",,Bạn cùng lớp\nLê Văn C,,,Bạn đại học';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_khach_moi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060D17] text-white font-serif">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm tracking-wider uppercase">Đang mở trang quản lý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071322] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0B1E36] border-b border-amber-400/30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Quay lại trang thiệp mời"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Thiệp Mời</span>
          </Link>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-black text-amber-300 tracking-wide flex items-center gap-2">
              <span>BẢNG ĐIỀU KHIỂN & QUẢN LÝ THIỆP MỜI</span>
            </h1>
            <p className="text-[11px] font-mono text-slate-400">
              Nhập thông tin thật, quản lý khách mời, upload ảnh trực tiếp & xem lời chúc
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isUploading && (
            <span className="px-3 py-1.5 rounded-xl bg-blue-900/80 text-blue-300 border border-blue-400/40 text-xs font-mono flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang tải ảnh...</span>
            </span>
          )}

          {/* Nút cài đặt GitHub Token để lưu trực tiếp trên web Vercel */}
          <button
            onClick={() => {
              setTempTokenInput(githubToken);
              setShowTokenModal(true);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors border ${
              githubToken
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/30'
            }`}
            title="Cài đặt GitHub Token để chỉnh sửa và lưu trực tiếp trên web Vercel"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {githubToken ? 'Đã nối GitHub' : 'Cài GitHub Token'}
            </span>
          </button>

          <button
            onClick={handleExportConfigJSON}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Tải file siteData.json về máy tính để cập nhật"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất file JSON</span>
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving || isUploading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-navy-950 font-serif font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'LƯU TẤT CẢ'}</span>
          </button>
        </div>
      </header>

      {/* Thông báo trạng thái Toast */}
      {statusMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-serif font-bold transition-all border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
            : 'bg-rose-950 border-rose-400 text-rose-200'
        }`}>
          {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Tabs Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation Tabs (Đã bỏ tab Lịch Trình) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-700/60 scrollbar-none">
          {[
            { id: 'info', label: 'Thông Tin & Địa Điểm', icon: MapPin },
            { id: 'guests', label: `Khách Mời (${config.guests?.length || 0})`, icon: Users },
            { id: 'collections', label: `Bộ Sưu Tập (${config.collections?.length || 0})`, icon: Layers },
            { id: 'photos', label: 'Ảnh Quanh Thư', icon: ImageIcon },
            { id: 'wishes', label: `Lời Chúc (${wishes.length})`, icon: MessageSquare },
            { id: 'checkins', label: `Ảnh Check-in (${checkins.length})`, icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-navy-950 shadow-md font-black'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: THÔNG TIN CHUNG, ĐỊA CHỈ, LIÊN HỆ, BÃI XE, ẢNH ĐẦU THƯ ================= */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* 1. Ảnh đầu thư mặc định (Upload trực tiếp) */}
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md">
              <h2 className="font-serif text-base font-bold text-amber-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Ảnh Đầu Thư Mặc Định (Áo Cử Nhân / Chân Dung)
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Ảnh này sẽ xuất hiện ở góc trên lá thư mời đối với những khách mời không có ảnh riêng. Bạn có thể tải ảnh trực tiếp từ máy tính/điện thoại!
              </p>
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="w-28 h-36 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-slate-900 flex-shrink-0 relative group">
                  <img
                    src={config.defaultLetterImage}
                    alt="Ảnh đầu thư"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-amber-300 font-mono">Xem trước</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="upload-default-letter"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const urls = await uploadFilesToServer([file]);
                        if (urls[0]) {
                          setConfig({ ...config, defaultLetterImage: urls[0] });
                          showStatus('Đã tải lên ảnh đầu thư thành công!', 'success');
                        }
                      }}
                    />
                    <label
                      htmlFor="upload-default-letter"
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Tải ảnh từ máy lên</span>
                    </label>
                    <span className="text-[11px] text-slate-400">hoặc dán đường dẫn ảnh bên dưới:</span>
                  </div>

                  <input
                    type="text"
                    value={config.defaultLetterImage}
                    onChange={(e) => setConfig({ ...config, defaultLetterImage: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                    placeholder="https://... hoặc /uploads/..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Địa chỉ & Google Maps */}
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-4">
              <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa Điểm & Bản Đồ Google Maps
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">Tên Hội Trường / Phòng:</label>
                  <input
                    type="text"
                    value={config.venueName}
                    onChange={(e) => setConfig({ ...config, venueName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 mb-1 block">Ngày giờ tốt nghiệp:</label>
                  <input
                    type="text"
                    value={config.graduationDate}
                    onChange={(e) => setConfig({ ...config, graduationDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-300 mb-1 block">Địa chỉ chi tiết:</label>
                  <input
                    type="text"
                    value={config.venueAddress}
                    onChange={(e) => setConfig({ ...config, venueAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-300 mb-1 block">Link Google Maps (khi khách bấm vào sẽ mở bản đồ chỉ đường):</label>
                  <input
                    type="text"
                    value={config.googleMapUrl}
                    onChange={(e) => setConfig({ ...config, googleMapUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300"
                  />
                </div>
              </div>
            </div>

            {/* 3. Liên hệ (Có thể nhiều số điện thoại, tên ứng với từng số) */}
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Danh Sách Số Điện Thoại Liên Hệ
                  </h2>
                  <p className="text-xs text-slate-400">Bạn có thể thêm số của bạn, số người thân, bạn bè đón tiếp...</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newContact: ContactPerson = {
                      id: `c-${Date.now()}`,
                      name: '',
                      phone: '',
                      relation: 'Hỗ trợ đón tiếp',
                    };
                    setConfig({ ...config, contacts: [...config.contacts, newContact] });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm số liên hệ</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.contacts.map((contact, index) => (
                  <div key={contact.id || index} className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Tên người liên hệ:</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...config.contacts];
                          updated[index].name = e.target.value;
                          setConfig({ ...config, contacts: updated });
                        }}
                        placeholder="VD: Trí Nguyễn / Mẹ Trí"
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Số điện thoại:</label>
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...config.contacts];
                          updated[index].phone = e.target.value;
                          setConfig({ ...config, contacts: updated });
                        }}
                        placeholder="VD: 0901 234 567"
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Vai trò / Ghi chú:</label>
                      <input
                        type="text"
                        value={contact.relation || ''}
                        onChange={(e) => {
                          const updated = [...config.contacts];
                          updated[index].relation = e.target.value;
                          setConfig({ ...config, contacts: updated });
                        }}
                        placeholder="VD: Tân Cử Nhân / Đón khách"
                        className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            contacts: config.contacts.filter((_, i) => i !== index),
                          });
                        }}
                        className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 cursor-pointer"
                        title="Xóa liên hệ này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Bãi giữ xe: CHỈ CÒN TÊN, MÔ TẢ, LINK MAPS (Đã bỏ loại xe, phí, mẹo theo yêu cầu) */}
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Danh Sách Vị Trí Bãi Giữ Xe
                  </h2>
                  <p className="text-xs text-slate-400">Hướng dẫn các bãi xe thuận tiện xung quanh địa điểm (chỉ gồm Tên, Mô tả & Link Maps)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPark: ParkingLocation = {
                      id: `park-${Date.now()}`,
                      name: 'Bãi Xe Mới',
                      description: 'Mô tả vị trí và lối đi vào...',
                      mapUrl: config.googleMapUrl,
                    };
                    setConfig({ ...config, parkingLocations: [...config.parkingLocations, newPark] });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm bãi xe</span>
                </button>
              </div>

              <div className="space-y-4">
                {config.parkingLocations.map((park, index) => (
                  <div key={park.id || index} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-amber-400">Bãi xe #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            parkingLocations: config.parkingLocations.filter((_, i) => i !== index),
                          });
                        }}
                        className="text-rose-400 hover:text-rose-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Tên bãi xe:</label>
                        <input
                          type="text"
                          value={park.name}
                          onChange={(e) => {
                            const updated = [...config.parkingLocations];
                            updated[index].name = e.target.value;
                            setConfig({ ...config, parkingLocations: updated });
                          }}
                          placeholder="VD: SCIC Building (Số 16 Trương Định)"
                          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Link Google Maps:</label>
                        <input
                          type="text"
                          value={park.mapUrl || ''}
                          onChange={(e) => {
                            const updated = [...config.parkingLocations];
                            updated[index].mapUrl = e.target.value;
                            setConfig({ ...config, parkingLocations: updated });
                          }}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300"
                        />
                      </div>

                      <div className="sm:col-span-12">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Mô tả vị trí & lối vào:</label>
                        <textarea
                          rows={2}
                          value={park.description}
                          onChange={(e) => {
                            const updated = [...config.parkingLocations];
                            updated[index].description = e.target.value;
                            setConfig({ ...config, parkingLocations: updated });
                          }}
                          placeholder="VD: Nằm ngay khúc giao gần trường, thuận tiện đi bộ vào hội trường..."
                          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: QUẢN LÝ DANH SÁCH KHÁCH MỜI ================= */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Danh Sách Khách Mời Cá Nhân Hóa ({config.guests.length} khách)
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Mã ID tự động tạo số tăng dần (1, 2, 3...). Hỗ trợ import nhanh file Excel/CSV!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Nút Import Excel/CSV */}
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Nhập Từ Excel / CSV</span>
                  </button>

                  {/* Nút thêm khách lẻ tự tăng ID */}
                  <button
                    type="button"
                    onClick={handleAddNewGuest}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Khách Mới</span>
                  </button>
                </div>
              </div>

              {/* Bảng danh sách khách */}
              <div className="space-y-4">
                {config.guests.map((guest, idx) => (
                  <div key={guest.id || idx} className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold flex items-center justify-center">
                          ID: #{guest.id}
                        </span>
                        <span className="font-serif font-bold text-sm text-white">
                          {guest.name || '(Chưa nhập tên khách)'}
                        </span>
                        {guest.secretLetter ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-900/80 text-blue-300 border border-blue-400/40 text-[10px] font-mono font-semibold">
                            ✉️ Có Thư Bí Mật
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            (Thư phổ thông)
                          </span>
                        )}
                        {guest.customLetterImage && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-semibold">
                            🖼️ Có Ảnh Riêng
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyGuestLink(guest)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
                          title="Sao chép link mời cá nhân hóa"
                        >
                          {copiedId === guest.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === guest.id ? 'Đã chép link' : 'Copy link mời'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setConfig({
                              ...config,
                              guests: config.guests.filter((_, i) => i !== idx),
                            });
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 cursor-pointer"
                          title="Xóa khách này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Mã ID (Số tự tăng):</label>
                        <input
                          type="text"
                          value={guest.id}
                          onChange={(e) => {
                            const updated = [...config.guests];
                            updated[idx].id = e.target.value;
                            setConfig({ ...config, guests: updated });
                          }}
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 font-bold"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Tên khách mời:</label>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => {
                            const updated = [...config.guests];
                            updated[idx].name = e.target.value;
                            setConfig({ ...config, guests: updated });
                          }}
                          placeholder="VD: Thảo My, Hoàng Minh..."
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Ghi chú (nhóm bạn / quan hệ):</label>
                        <input
                          type="text"
                          value={guest.note || ''}
                          onChange={(e) => {
                            const updated = [...config.guests];
                            updated[idx].note = e.target.value;
                            setConfig({ ...config, guests: updated });
                          }}
                          placeholder="VD: Bạn thân cấp 3, Bạn đại học..."
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                        />
                      </div>

                      {/* Ảnh đầu thư riêng của khách này (Upload trực tiếp) */}
                      <div className="sm:col-span-12">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                          Ảnh đầu thư riêng cho khách này (Nếu bỏ trống sẽ hiển thị ảnh mặc định):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id={`upload-guest-photo-${guest.id}`}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const urls = await uploadFilesToServer([file]);
                              if (urls[0]) {
                                const updated = [...config.guests];
                                updated[idx].customLetterImage = urls[0];
                                setConfig({ ...config, guests: updated });
                                showStatus(`Đã tải ảnh riêng cho "${guest.name}"!`, 'success');
                              }
                            }}
                          />
                          <label
                            htmlFor={`upload-guest-photo-${guest.id}`}
                            className="px-3 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer border border-amber-400/40 whitespace-nowrap"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh</span>
                          </label>

                          <input
                            type="text"
                            value={guest.customLetterImage || ''}
                            onChange={(e) => {
                              const updated = [...config.guests];
                              updated[idx].customLetterImage = e.target.value;
                              setConfig({ ...config, guests: updated });
                            }}
                            placeholder="https://... hoặc bấm nút Tải ảnh"
                            className="flex-1 p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300"
                          />

                          {guest.customLetterImage && (
                            <div className="w-8 h-8 rounded overflow-hidden border border-amber-400 flex-shrink-0">
                              <img src={guest.customLetterImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nội dung Thư bí mật riêng cho khách này */}
                      <div className="sm:col-span-12">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                          Nội dung Thư Bí Mật (Chỉ hiện nút 'Mở Thư Bí Mật' trước ngày 14/11/2026 khi có nội dung):
                        </label>
                        <textarea
                          rows={3}
                          value={guest.secretLetter || ''}
                          onChange={(e) => {
                            const updated = [...config.guests];
                            updated[idx].secretLetter = e.target.value;
                            setConfig({ ...config, guests: updated });
                          }}
                          placeholder="Nhập tâm sự bí mật dành riêng cho người bạn này... (Để trống nếu là khách mời phổ thông không có thư bí mật)"
                          className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-serif text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BỘ SƯU TẬP ẢNH (HỖ TRỢ UPLOAD NHIỀU ẢNH CÙNG LÚC) ================= */}
        {activeTab === 'collections' && (
          <div className="space-y-6">
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Quản Lý Album Bộ Sưu Tập Khoảnh Khắc
                  </h2>
                  <p className="text-xs text-slate-400">Các album ảnh kỷ niệm (Có thể chọn và tải lên nhiều ảnh cùng lúc từ máy)</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCol: CollectionItem = {
                      id: `col-${Date.now()}`,
                      title: 'Album mới',
                      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
                      description: 'Mô tả album',
                      badge: 'Kỷ Niệm',
                      images: []
                    };
                    setConfig({ ...config, collections: [...config.collections, newCol] });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Album Mới</span>
                </button>
              </div>

              <div className="space-y-6">
                {config.collections.map((col, colIdx) => (
                  <div key={col.id || colIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-serif font-bold text-sm text-amber-300">Album #{colIdx + 1}: {col.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            collections: config.collections.filter((_, i) => i !== colIdx),
                          });
                        }}
                        className="text-rose-400 hover:text-rose-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Album</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Tiêu đề Album:</label>
                        <input
                          type="text"
                          value={col.title}
                          onChange={(e) => {
                            const updated = [...config.collections];
                            updated[colIdx].title = e.target.value;
                            setConfig({ ...config, collections: updated });
                          }}
                          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Huy hiệu (Badge):</label>
                        <input
                          type="text"
                          value={col.badge}
                          onChange={(e) => {
                            const updated = [...config.collections];
                            updated[colIdx].badge = e.target.value;
                            setConfig({ ...config, collections: updated });
                          }}
                          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-xs text-amber-300"
                        />
                      </div>

                      {/* Ảnh bìa Album */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Ảnh bìa Album:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id={`upload-col-cover-${col.id}`}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const urls = await uploadFilesToServer([file]);
                              if (urls[0]) {
                                const updated = [...config.collections];
                                updated[colIdx].coverImage = urls[0];
                                setConfig({ ...config, collections: updated });
                                showStatus(`Đã tải ảnh bìa cho album "${col.title}"!`, 'success');
                              }
                            }}
                          />
                          <label
                            htmlFor={`upload-col-cover-${col.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer border border-amber-400/40 whitespace-nowrap"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải bìa</span>
                          </label>

                          <input
                            type="text"
                            value={col.coverImage}
                            onChange={(e) => {
                              const updated = [...config.collections];
                              updated[colIdx].coverImage = e.target.value;
                              setConfig({ ...config, collections: updated });
                            }}
                            className="flex-1 p-2 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300"
                          />

                          {col.coverImage && (
                            <div className="w-8 h-8 rounded overflow-hidden border border-amber-400 flex-shrink-0">
                              <img src={col.coverImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Danh sách ảnh trong album này (HỖ TRỢ UPLOAD NHIỀU ẢNH CÙNG LÚC) */}
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          Ảnh bên trong Album ({col.images.length} ảnh):
                        </span>

                        <div className="flex items-center gap-2">
                          {/* NÚT TẢI NHIỀU ẢNH CÙNG LÚC */}
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            id={`upload-album-multiple-${col.id}`}
                            className="hidden"
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (!files || files.length === 0) return;
                              const urls = await uploadFilesToServer(files);
                              if (urls.length > 0) {
                                const newImageItems = urls.map((u) => ({
                                  url: u,
                                  caption: '',
                                }));
                                const updated = [...config.collections];
                                updated[colIdx].images = [...updated[colIdx].images, ...newImageItems];
                                setConfig({ ...config, collections: updated });
                                showStatus(`Đã tải lên thêm ${urls.length} ảnh vào album "${col.title}"!`, 'success');
                              }
                            }}
                          />
                          <label
                            htmlFor={`upload-album-multiple-${col.id}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải Lên Nhiều Ảnh Cùng Lúc</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...config.collections];
                              updated[colIdx].images.push({
                                url: '',
                                caption: '',
                              });
                              setConfig({ ...config, collections: updated });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm link</span>
                          </button>
                        </div>
                      </div>

                      {col.images.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-800/40 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                          Chưa có ảnh nào trong album này. Hãy bấm <span className="text-amber-300 font-bold">&quot;Tải Lên Nhiều Ảnh Cùng Lúc&quot;</span> ở trên để chọn ảnh từ máy!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {col.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col gap-2 relative">
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-700 relative">
                                {img.url ? (
                                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                                    Chưa có ảnh
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...config.collections];
                                    updated[colIdx].images = updated[colIdx].images.filter((_, i) => i !== imgIdx);
                                    setConfig({ ...config, collections: updated });
                                  }}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer"
                                  title="Xóa ảnh này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={img.url}
                                  onChange={(e) => {
                                    const updated = [...config.collections];
                                    updated[colIdx].images[imgIdx].url = e.target.value;
                                    setConfig({ ...config, collections: updated });
                                  }}
                                  placeholder="Đường dẫn ảnh..."
                                  className="w-full p-1.5 rounded bg-slate-900 text-[10px] font-mono text-amber-300 border border-slate-700"
                                />
                                <input
                                  type="text"
                                  value={img.caption}
                                  onChange={(e) => {
                                    const updated = [...config.collections];
                                    updated[colIdx].images[imgIdx].caption = e.target.value;
                                    setConfig({ ...config, collections: updated });
                                  }}
                                  placeholder="Ghi chú chú thích ảnh..."
                                  className="w-full p-1.5 rounded bg-slate-900 text-[10px] text-white border border-slate-700"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ẢNH XUNG QUANH THIỆP MỜI (UPLOAD NHIỀU ẢNH CÙNG LÚC) ================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md space-y-6">
              <div>
                <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Cấu Hình Các Ảnh Kỷ Niệm Đong Đưa Xung Quanh Lá Thư
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Các bức ảnh này hiển thị đong đưa mềm mại 2 bên cánh gà và phía sau thư trên điện thoại & máy tính. Bạn có thể chọn và tải lên nhiều ảnh cùng lúc!
                </p>
              </div>

              {/* Nhóm ảnh bên trái */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">Các ảnh bên Trái ({config.sidePhotosLeft.length} ảnh):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="upload-side-left-multiple"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const urls = await uploadFilesToServer(files);
                        if (urls.length > 0) {
                          const newSidePhotos: SidePhotoItem[] = urls.map((u, i) => ({
                            id: `l-${Date.now()}-${i}`,
                            src: u,
                            rotate: i % 2 === 0 ? -7 - i : 8 + i,
                            position: 'left',
                            top: `${Math.min(90, 5 + i * 30)}%`,
                          }));
                          setConfig({
                            ...config,
                            sidePhotosLeft: [...config.sidePhotosLeft, ...newSidePhotos],
                          });
                          showStatus(`Đã tải lên thêm ${urls.length} ảnh bên trái!`, 'success');
                        }
                      }}
                    />
                    <label
                      htmlFor="upload-side-left-multiple"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải Lên Nhiều Ảnh Bên Trái</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.sidePhotosLeft.map((photo, i) => (
                    <div key={photo.id || i} className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 relative">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 bg-slate-800 relative">
                        <img src={photo.src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setConfig({
                              ...config,
                              sidePhotosLeft: config.sidePhotosLeft.filter((_, idx) => idx !== i),
                            });
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-single-left-${i}`}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const urls = await uploadFilesToServer([file]);
                            if (urls[0]) {
                              const updated = [...config.sidePhotosLeft];
                              updated[i].src = urls[0];
                              setConfig({ ...config, sidePhotosLeft: updated });
                              showStatus('Đã đổi ảnh thành công!', 'success');
                            }
                          }}
                        />
                        <label
                          htmlFor={`upload-single-left-${i}`}
                          className="px-2 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-mono cursor-pointer border border-amber-400/40"
                        >
                          Đổi ảnh
                        </label>
                        <input
                          type="text"
                          value={photo.src}
                          onChange={(e) => {
                            const updated = [...config.sidePhotosLeft];
                            updated[i].src = e.target.value;
                            setConfig({ ...config, sidePhotosLeft: updated });
                          }}
                          className="flex-1 p-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nhóm ảnh bên phải */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">Các ảnh bên Phải ({config.sidePhotosRight.length} ảnh):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="upload-side-right-multiple"
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const urls = await uploadFilesToServer(files);
                        if (urls.length > 0) {
                          const newSidePhotos: SidePhotoItem[] = urls.map((u, i) => ({
                            id: `r-${Date.now()}-${i}`,
                            src: u,
                            rotate: i % 2 === 0 ? 9 + i : -6 - i,
                            position: 'right',
                            top: `${Math.min(90, 5 + i * 30)}%`,
                          }));
                          setConfig({
                            ...config,
                            sidePhotosRight: [...config.sidePhotosRight, ...newSidePhotos],
                          });
                          showStatus(`Đã tải lên thêm ${urls.length} ảnh bên phải!`, 'success');
                        }
                      }}
                    />
                    <label
                      htmlFor="upload-side-right-multiple"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải Lên Nhiều Ảnh Bên Phải</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.sidePhotosRight.map((photo, i) => (
                    <div key={photo.id || i} className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 relative">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-700 bg-slate-800 relative">
                        <img src={photo.src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setConfig({
                              ...config,
                              sidePhotosRight: config.sidePhotosRight.filter((_, idx) => idx !== i),
                            });
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id={`upload-single-right-${i}`}
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const urls = await uploadFilesToServer([file]);
                            if (urls[0]) {
                              const updated = [...config.sidePhotosRight];
                              updated[i].src = urls[0];
                              setConfig({ ...config, sidePhotosRight: updated });
                              showStatus('Đã đổi ảnh thành công!', 'success');
                            }
                          }}
                        />
                        <label
                          htmlFor={`upload-single-right-${i}`}
                          className="px-2 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-mono cursor-pointer border border-amber-400/40"
                        >
                          Đổi ảnh
                        </label>
                        <input
                          type="text"
                          value={photo.src}
                          onChange={(e) => {
                            const updated = [...config.sidePhotosRight];
                            updated[i].src = e.target.value;
                            setConfig({ ...config, sidePhotosRight: updated });
                          }}
                          className="flex-1 p-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: QUẢN LÝ LỜI CHÚC TỪ KHÁCH MỜI ================= */}
        {activeTab === 'wishes' && (
          <div className="space-y-6">
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Danh Sách Lời Chúc Của Khách ({wishes.length} lời chúc)
                  </h2>
                  <p className="text-xs text-slate-400">Các lời chúc và ảnh kỷ niệm mà khách đã gửi qua biểu mẫu Lưu Bút</p>
                </div>
              </div>

              {wishes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  Chưa có lời chúc nào được gửi lên.
                </div>
              ) : (
                <div className="space-y-3">
                  {wishes.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white font-serif">{w.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            w.attendance === 'yes' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            w.attendance === 'no' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {w.attendance === 'yes' ? '✓ Tham gia' : w.attendance === 'no' ? 'Bận' : 'Có thể'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(w.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-serif">
                          &ldquo;{w.message}&rdquo;
                        </p>

                        {w.images && w.images.length > 0 && (
                          <div className="flex gap-2 pt-1">
                            {w.images.map((imgUrl, imgIdx) => (
                              <a key={imgIdx} href={imgUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded overflow-hidden border border-slate-700 block">
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center sm:items-start justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteWish(w.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-mono flex items-center gap-1 cursor-pointer border border-rose-800/80"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 6: QUẢN LÝ ẢNH CHECK-IN PHOTOBOOTH ================= */}
        {activeTab === 'checkins' && (
          <div className="space-y-6">
            <div className="bg-[#0B1E36] p-5 sm:p-6 rounded-2xl border border-amber-400/30 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-base font-bold text-amber-300 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Bộ Sưu Tập Ảnh Check-in Photobooth 9:16 ({checkins.length} ảnh)
                  </h2>
                  <p className="text-xs text-slate-400">Toàn bộ ảnh photobooth khách đã chụp và lưu vào hệ thống</p>
                </div>
              </div>

              {checkins.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  Chưa có ảnh check-in nào được khách chụp và lưu lại.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {checkins.map((chk) => (
                    <div key={chk.id} className="p-2 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col justify-between space-y-2">
                      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black border border-amber-400/40">
                        <img src={chk.imageUrl} alt="Checkin" className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-xs text-white truncate font-serif">
                          {chk.guestName || 'Khách mời'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(chk.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <a
                          href={chk.imageUrl}
                          download={`photobooth-${chk.id}.png`}
                          className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono text-center flex items-center justify-center gap-1"
                          title="Tải ảnh gốc về máy"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteCheckin(chk.id)}
                          className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL IMPORT KHÁCH TỪ EXCEL / CSV ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowImportModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-2xl bg-[#0B1E36] border-2 border-amber-400/70 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif text-lg font-bold text-white">
                  Nhập Danh Sách Khách Mời Từ Excel / CSV
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-200 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-white mb-0.5">💡 Cách thực hiện rất đơn giản:</p>
                  <p>1. Chọn file <strong>.csv</strong> từ Excel của bạn, hoặc</p>
                  <p>2. Mở file Excel, chọn các dòng rồi bấm <strong>Ctrl+C</strong> và dán (<strong>Ctrl+V</strong>) vào ô bên dưới!</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file CSV mẫu</span>
                </button>
              </div>

              {/* Cách 1: Chọn file CSV */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  Cách 1: Chọn file từ máy (.csv, .txt, .tsv):
                </label>
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUploadCSV}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-navy-950 hover:file:bg-amber-300 cursor-pointer"
                />
              </div>

              {/* Cách 2: Copy Paste từ Excel */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  Cách 2: Hoặc Dán trực tiếp từ Excel (Copy từ bảng tính và Paste vào đây):
                </label>
                <textarea
                  rows={4}
                  value={importPasteText}
                  onChange={(e) => {
                    setImportPasteText(e.target.value);
                    parseGuestData(e.target.value);
                  }}
                  placeholder="Ví dụ dán vào:&#10;Hoàng Nam	Gửi người anh em...	https://...	Bạn thân&#10;Thảo My	Gửi My thân mến...		Bạn cùng lớp"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Bảng Preview kết quả đọc được */}
              {parsedImportGuests.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      ✓ Đã nhận diện được {parsedImportGuests.length} khách mời:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ID sẽ tự động đánh số tiếp tục từ: #{getNextGuestId(config.guests)}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                    {parsedImportGuests.map((g, i) => (
                      <div key={i} className="text-xs flex items-center justify-between p-1.5 rounded bg-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-400 font-bold text-[11px]">#{i + 1}</span>
                          <span className="font-serif font-bold text-white">{g.name}</span>
                          {g.secretLetter && (
                            <span className="text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                              Có thư bí mật
                            </span>
                          )}
                          {g.note && (
                            <span className="text-[10px] text-slate-400 italic">
                              ({g.note})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif text-xs font-bold"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={parsedImportGuests.length === 0}
                onClick={handleConfirmImportGuests}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 text-navy-950 font-serif font-black text-xs disabled:opacity-50 cursor-pointer shadow"
              >
                Thêm {parsedImportGuests.length} Khách Vào Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cài Đặt GitHub Token Để Lưu Trực Tiếp Trên Web Vercel */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1E36] border border-amber-400/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowTokenModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-amber-300">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-black text-base">CÀI ĐẶT GITHUB TOKEN</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Dán mã <strong>GitHub Personal Access Token</strong> (chuỗi bắt đầu bằng <code className="text-amber-300">ghp_...</code>) của bạn vào đây. Sau khi lưu, mỗi khi bạn vào trang Admin trên web Vercel và bấm <strong>&quot;LƯU TẤT CẢ&quot;</strong>, dữ liệu sẽ tự động lưu thẳng vào GitHub mà không bị lỗi!
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                GitHub Token:
              </label>
              <input
                type="password"
                value={tempTokenInput}
                onChange={(e) => setTempTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              {githubToken && (
                <button
                  type="button"
                  onClick={() => handleSaveGitHubToken('')}
                  className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-mono cursor-pointer"
                >
                  Xóa Token
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveGitHubToken(tempTokenInput)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-navy-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                Lưu Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
