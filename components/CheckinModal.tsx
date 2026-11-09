'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, X, RotateCcw, Download, Clock, Image as ImageIcon, 
  SwitchCamera, Sparkles, Check, Share2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '@/lib/sound';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName?: string;
}

export default function CheckinModal({ isOpen, onClose, guestName }: CheckinModalProps) {
  const [mode, setMode] = useState<'camera' | 'preview' | 'completed'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [savedPhotoboothUrl, setSavedPhotoboothUrl] = useState<string | null>(null);
  
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [timerSetting, setTimerSetting] = useState<number>(0); // 0s, 3s, 5s, 10s
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // CÁC STATE CHO ZOOM & CÂN BẰNG SÁNG CHẠY NGẦM KHÔNG GÂY RỐI MẮT
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [brightnessAdjustment, setBrightnessAdjustment] = useState<number>(1.0);
  const [focusBox, setFocusBox] = useState<{ x: number; y: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Refs cho sự kiện cử chỉ cảm ứng 2 ngón tay (Pinch to zoom) và chạm đo sáng (Tap to expose)
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1.0);
  const isPinchingRef = useRef<boolean>(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const focusBoxTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Áp dụng hardware zoom nếu thiết bị có hỗ trợ (Android / Chrome WebRTC)
  const applyHardwareZoom = (val: number) => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() as any) || {};
        if (capabilities.zoom) {
          const clamped = Math.min(Math.max(val, capabilities.zoom.min || 1), capabilities.zoom.max || 3.5);
          track.applyConstraints({ advanced: [{ zoom: clamped } as any] }).catch(() => {});
        }
      }
    }
  };

  // 1. MỞ CAMERA HTML5 CHUẨN (SIÊU NHẸ, MỞ NGAY 0.1S)
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setZoomLevel(1.0);
    setBrightnessAdjustment(1.0);
    setFocusBox(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ mở camera trực tiếp.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1080 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err1) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((playErr) => {
          console.warn('Video play warning:', playErr);
        });
      }
    } catch (err: any) {
      console.warn('Lỗi mở camera:', err);
      setCameraError('Không thể mở camera. Bạn có thể tải ảnh từ máy bằng nút bên dưới!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing, mode]);

  // Đổi camera trước / sau
  const toggleFacingMode = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Chuyển đổi hẹn giờ (0s -> 3s -> 5s -> 10s)
  const cycleTimer = () => {
    const options = [0, 3, 5, 10];
    const nextIdx = (options.indexOf(timerSetting) + 1) % options.length;
    setTimerSetting(options[nextIdx]);
  };

  // 2. CHỨC NĂNG CHẠM ĐỂ CÂN BẰNG SÁNG & ĐO NÉT (TAP TO EXPOSE / BALANCE LIGHT)
  const handleTapToBalanceLight = useCallback((clientX: number, clientY: number) => {
    if (!cameraContainerRef.current || !videoRef.current) return;
    const rect = cameraContainerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    if (relX < 0 || relX > rect.width || relY < 0 || relY > rect.height) return;

    // Hiển thị khung đo sáng / lấy nét màu vàng tại vị trí chạm
    setFocusBox({ x: relX, y: relY });
    if (focusBoxTimerRef.current) clearTimeout(focusBoxTimerRef.current);
    focusBoxTimerRef.current = setTimeout(() => {
      setFocusBox(null);
    }, 1800);

    // Kích hoạt lấy nét & cân bằng sáng phần cứng nếu camera hỗ trợ
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const caps = (track.getCapabilities?.() as any) || {};
        const constraints: any = {};
        if (caps.focusMode && caps.focusMode.includes('continuous')) constraints.focusMode = 'continuous';
        if (caps.exposureMode && caps.exposureMode.includes('continuous')) constraints.exposureMode = 'continuous';
        if (Object.keys(constraints).length > 0) {
          track.applyConstraints({ advanced: [constraints] }).catch(() => {});
        }
      }
    }

    // Thuật toán đo sáng thông minh bằng Canvas:
    // Lấy mẫu độ sáng tại vùng vừa chạm trên video để cân bằng sáng tự động
    try {
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 100;
        sampleCanvas.height = 100;
        const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
        if (sCtx) {
          sCtx.drawImage(video, 0, 0, 100, 100);

          let normX = relX / rect.width;
          if (cameraFacing === 'user') normX = 1 - normX;
          const normY = relY / rect.height;

          const sampleX = Math.max(0, Math.min(80, Math.round(normX * 100 - 10)));
          const sampleY = Math.max(0, Math.min(80, Math.round(normY * 100 - 10)));
          const imgData = sCtx.getImageData(sampleX, sampleY, 20, 20);

          let totalLum = 0;
          const pixelCount = imgData.data.length / 4;
          for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            totalLum += 0.299 * r + 0.587 * g + 0.114 * b;
          }
          const avgLum = totalLum / pixelCount; // 0..255

          let targetBrightness = 1.0;
          if (avgLum < 105) {
            // Vùng chạm bị tối: tăng sáng bù trừ
            targetBrightness = Math.min(1.35, 1.0 + (105 - avgLum) / 160);
          } else if (avgLum > 165) {
            // Vùng chạm bị chói sáng: giảm độ chói
            targetBrightness = Math.max(0.82, 1.0 - (avgLum - 165) / 190);
          } else {
            // Vùng sáng đã tương đối chuẩn: nâng nhẹ màu da tươi tắn
            targetBrightness = 1.08;
          }

          setBrightnessAdjustment(Number(targetBrightness.toFixed(2)));
        }
      }
    } catch (e) {
      // Fallback nếu không đọc được pixel
      setBrightnessAdjustment((prev) => (prev === 1.0 ? 1.15 : 1.0));
    }
  }, [cameraFacing]);

  // 3. SỰ KIỆN CỬ CHỈ CẢM ỨNG (TOUCH EVENTS: PINCH TO ZOOM & TAP)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Bắt đầu cử chỉ 2 ngón tay (Pinch)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoomLevel;
      isPinchingRef.current = true;
    } else if (e.touches.length === 1) {
      // Bắt đầu chạm 1 ngón tay (Chuẩn bị xác định là Tap hay vuốt)
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartTimeRef.current = Date.now();
      isPinchingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      // Đang vuốt 2 ngón tay ra hoặc vào
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(pinchStartZoomRef.current * ratio, 1.0), 3.5);
      const formattedZoom = Number(newZoom.toFixed(2));
      setZoomLevel(formattedZoom);
      applyHardwareZoom(formattedZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2 && isPinchingRef.current) {
      isPinchingRef.current = false;
      pinchStartDistRef.current = null;
    } else if (e.touches.length === 0 && touchStartPosRef.current && !isPinchingRef.current) {
      // Kiểm tra xem có phải là chạm nhẹ (Tap) không
      const touchDuration = Date.now() - touchStartTimeRef.current;
      const changedTouch = e.changedTouches[0];
      if (changedTouch) {
        const moveDist = Math.hypot(
          changedTouch.clientX - touchStartPosRef.current.x,
          changedTouch.clientY - touchStartPosRef.current.y
        );
        if (touchDuration < 320 && moveDist < 16) {
          handleTapToBalanceLight(changedTouch.clientX, changedTouch.clientY);
        }
      }
      touchStartPosRef.current = null;
    }
  };

  // Hỗ trợ click chuột trên máy tính để cân bằng sáng
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinchingRef.current) {
      handleTapToBalanceLight(e.clientX, e.clientY);
    }
  };

  // Bấm chụp ảnh (có hẹn giờ nếu bật)
  const handleTriggerCheckin = () => {
    if (timerSetting > 0) {
      setCountdown(timerSetting);
      let cur = timerSetting;
      const interval = setInterval(() => {
        cur -= 1;
        if (cur <= 0) {
          clearInterval(interval);
          setCountdown(null);
          takeSnapshot();
        } else {
          setCountdown(cur);
        }
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // Cắt ảnh chụp vuông 404x404 từ camera kèm áp dụng chính xác độ Zoom & Cân bằng sáng
  const takeSnapshot = () => {
    const video = videoRef.current;
    const W = 404;
    const H = 404;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacing === 'user') {
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }

    // Áp dụng cân bằng sáng vào ảnh chụp
    if (brightnessAdjustment !== 1.0) {
      const contrastVal = 1 + (brightnessAdjustment - 1) * 0.15;
      ctx.filter = `brightness(${brightnessAdjustment}) contrast(${contrastVal})`;
    }

    if (video && video.videoWidth > 0) {
      const vSize = Math.min(video.videoWidth, video.videoHeight);
      // Cắt ảnh theo tỉ lệ zoom
      const cropSize = vSize / zoomLevel;
      const sx = (video.videoWidth - cropSize) / 2;
      const sy = (video.videoHeight - cropSize) / 2;
      ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, W, H);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    stopCamera();
    setMode('preview');
    soundFX.playCameraClick();
  };

  // Tải ảnh từ thiết bị lên (thay thế cho chụp nếu khách muốn)
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const W = 404;
        const H = 404;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, W, H);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        stopCamera();
        setMode('preview');
        soundFX.playCameraClick();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Chụp lại
  const handleRetake = () => {
    setCapturedImage(null);
    setSavedPhotoboothUrl(null);
    setZoomLevel(1.0);
    setBrightnessAdjustment(1.0);
    setMode('camera');
  };

  // Ghép ảnh hoàn chỉnh với background.png (576x1024) và khungcamera.png (576x1024)
  const handleFinalizePhotobooth = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);

    try {
      const photoboothCanvas = document.createElement('canvas');
      photoboothCanvas.width = 576;
      photoboothCanvas.height = 1024;
      const ctx = photoboothCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Tải ảnh nền background.png
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject(new Error('Lỗi tải background.png'));
        bgImg.src = '/background.png';
      });

      // 2. Tải ảnh người chụp
      const photoImg = new Image();
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = () => reject(new Error('Lỗi tải ảnh chụp'));
        photoImg.src = capturedImage;
      });

      // 3. Tải khung ảnh khungcamera.png
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = () => reject(new Error('Lỗi tải khungcamera.png'));
        frameImg.src = '/khungcamera.png';
      });

      // VẼ LỚP 1: Nền thiệp 576x1024
      ctx.drawImage(bgImg, 0, 0, 576, 1024);

      // VẼ LỚP 2: Ảnh chụp của khách vào đúng ô vuông (x: 86, y: 310, w: 404, h: 404)
      ctx.drawImage(photoImg, 86, 310, 404, 404);

      // VẼ LỚP 3: Khung camera khungcamera.png đè lên trên cùng 576x1024
      ctx.drawImage(frameImg, 0, 0, 576, 1024);

      const finalDataUrl = photoboothCanvas.toDataURL('image/png', 0.98);
      setSavedPhotoboothUrl(finalDataUrl);
      setMode('completed');

      // Tự động lưu vào máy chủ
      fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: finalDataUrl,
          guestName: guestName || 'Khách mời check-in',
        }),
      }).catch((e) => console.warn('Auto save checkin failed:', e));

      soundFX.playCelebration();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#27A4F2', '#FF6B8B', '#FFD166', '#ffffff'],
      });
    } catch (err) {
      console.error('Lỗi khi ghép photobooth:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const downloadImageFile = async (dataUrl: string) => {
    const filename = `checkin-tot-nghiep-tri-nguyen-${Date.now()}.png`;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ảnh Check-in Tốt Nghiệp Trí Nguyễn',
          text: 'Khoảnh khắc thanh xuân rực rỡ tại Lễ tốt nghiệp Trí Nguyễn 🎓',
        });
        return;
      }
    } catch (shareErr) {
      console.log('Web share not supported or dismissed:', shareErr);
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none overflow-hidden touch-none p-0 sm:p-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* CONTAINER CHÍNH: KHUNG TỈ LỆ 9:16 VỪA VẶN MÀN HÌNH ĐIỆN THOẠI */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="relative aspect-[9/16] w-auto h-full max-h-[100dvh] max-w-full flex items-center justify-center shadow-2xl overflow-hidden bg-sky-200 z-10"
          style={{
            maxHeight: '100dvh',
            maxWidth: 'calc(100dvh * 9 / 16)',
          }}
        >
          {/* NỀN THIỆP BACKGROUND.PNG */}
          <img
            src="/background.png"
            alt="Photobooth Background"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          />

          {/* ================= NÚT ĐÓNG & HẸN GIỜ: Ở MÉP TRÊN CỦA ĐƯỜNG NÉT ĐỨT ================= */}
          <button
            onClick={handleCloseModal}
            className="absolute top-[11.2%] left-[6.5%] z-30 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-navy-950 font-bold text-xs shadow-md backdrop-blur-sm flex items-center gap-1 cursor-pointer transition-transform active:scale-95 border border-slate-200"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đóng</span>
          </button>

          {mode === 'camera' && (
            <button
              onClick={cycleTimer}
              className={`absolute top-[11.2%] right-[6.5%] z-30 px-3 py-1.5 rounded-full font-mono text-xs font-bold shadow-md backdrop-blur-sm flex items-center gap-1 cursor-pointer transition-all border ${
                timerSetting > 0
                  ? 'bg-amber-400 text-navy-950 border-amber-300 scale-105'
                  : 'bg-white/95 text-navy-900 hover:bg-white border-slate-200'
              }`}
              title="Hẹn giờ chụp ảnh"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timerSetting > 0 ? `${timerSetting}s` : 'Hẹn giờ'}</span>
            </button>
          )}

          {/* ================= Ô CAMERA / CHỤP ẢNH: VỪA VẶN Ô XANH LÁ (86, 310, 404, 404) ================= */}
          <div
            ref={cameraContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleContainerClick}
            className="absolute overflow-hidden z-10 flex items-center justify-center bg-slate-900 rounded-sm cursor-crosshair touch-none select-none"
            style={{
              left: '14.93%',
              top: '30.27%',
              width: '70.14%',
              height: '39.45%',
            }}
          >
            {/* ĐẾM NGƯỢC COUNTDOWN */}
            {countdown !== null && (
              <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center pointer-events-none">
                <motion.span
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-serif font-black text-6xl text-amber-300 drop-shadow-[0_0_20px_#f59e0b]"
                >
                  {countdown}
                </motion.span>
              </div>
            )}

            {/* MÀN HÌNH CAMERA */}
            {mode === 'camera' ? (
              <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                {/* THẺ VIDEO VỚI HIỆU ỨNG ZOOM MƯỢT VÀ BÙ ĐỘ SÁNG THỰC TẾ */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    transform: `${cameraFacing === 'user' ? 'scaleX(-1) ' : ''}scale(${zoomLevel})`,
                    filter: brightnessAdjustment !== 1.0 
                      ? `brightness(${brightnessAdjustment}) contrast(${1 + (brightnessAdjustment - 1) * 0.15})` 
                      : 'none',
                    transition: isPinchingRef.current ? 'none' : 'transform 0.12s ease-out, filter 0.25s ease-out',
                  }}
                  className="w-full h-full object-cover origin-center pointer-events-none"
                />

                {/* KHUNG LẤY NÉT NHẸ KHI CHẠM (TỰ BIẾN MẤT SAU 0.5S) */}
                {focusBox && (
                  <motion.div
                    initial={{ scale: 1.3, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.55 }}
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
                    style={{ left: focusBox.x, top: focusBox.y }}
                  >
                    <div className="w-11 h-11 border border-white/80 rounded-sm shadow-sm" />
                  </motion.div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 p-4 bg-slate-900/90 text-white flex flex-col items-center justify-center text-center gap-2 z-40">
                    <p className="text-xs text-amber-300 font-medium">{cameraError}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#27A4F2] text-white text-xs font-bold rounded-lg shadow"
                    >
                      Tải ảnh từ máy
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* MÀN HÌNH XEM ẢNH ĐÃ CHỤP */
              <div className="relative w-full h-full">
                <img
                  src={capturedImage || ''}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* ================= KHUNG CAMERA OVERLAY (KHUNGCAMERA.PNG) ================= */}
          {(mode === 'preview' || mode === 'completed') && (
            <img
              src="/khungcamera.png"
              alt="Khung Camera"
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20 select-none animate-fadeIn"
            />
          )}

          {/* INPUT CHỌN FILE ẢNH ẨN */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadFile}
          />

          {/* ================= KHUNG NÚT ĐIỀU KHIỂN TRONG VÙNG TRẮNG DƯỚI Ô XANH LÁ (TOP: 71.5% ĐẾN 85%) ================= */}
          {/* 1. MÀN HÌNH CAMERA: 3 NÚT RÕ RÀNG, ĐẸP MẮT */}
          {mode === 'camera' && (
            <div 
              className="absolute inset-x-6 z-30 flex items-center justify-around pointer-events-auto"
              style={{
                top: '71.5%',
                bottom: '15.5%',
              }}
            >
              {/* Nút Tải ảnh lên từ máy */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-13 h-13 rounded-full bg-[#EDF6FD] hover:bg-[#DDF0FD] border-2 border-[#27A4F2]/30 text-navy-950 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                title="Tải ảnh từ máy"
              >
                <ImageIcon className="w-5.5 h-5.5 text-[#27A4F2]" />
              </button>

              {/* Nút Chụp Ảnh To Nổi Bật (~76px) */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleTriggerCheckin}
                className="relative p-1 rounded-full bg-gradient-to-r from-white to-sky-100 shadow-xl cursor-pointer"
              >
                <div className="w-18 h-18 rounded-full border-4 border-[#27A4F2] bg-white flex items-center justify-center shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-[#27A4F2] hover:bg-[#1E8FD5] flex items-center justify-center shadow transition-colors">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.button>

              {/* Nút Xoay Camera */}
              <button
                onClick={toggleFacingMode}
                className="w-13 h-13 rounded-full bg-[#EDF6FD] hover:bg-[#DDF0FD] border-2 border-[#27A4F2]/30 text-navy-950 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                title="Đổi camera trước / sau"
              >
                <SwitchCamera className="w-5.5 h-5.5 text-[#27A4F2]" />
              </button>
            </div>
          )}

          {/* 2. MÀN HÌNH XEM TRƯỚC ẢNH VỪA CHỤP */}
          {mode === 'preview' && (
            <div 
              className="absolute inset-x-6 z-30 flex items-center justify-center gap-3 pointer-events-auto bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-slate-200"
              style={{
                top: '71.5%',
                bottom: '15.5%',
              }}
            >
              <button
                onClick={handleRetake}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chụp Lại</span>
              </button>

              <button
                onClick={handleFinalizePhotobooth}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Đang ghép...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Ghép Khung & Lưu</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 3. MÀN HÌNH HOÀN THÀNH */}
          {mode === 'completed' && savedPhotoboothUrl && (
            <div 
              className="absolute inset-x-5 z-30 flex flex-col items-center justify-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-slate-200"
              style={{
                top: '71.5%',
                bottom: '15.5%',
              }}
            >
              <p className="text-[10px] text-slate-600 font-medium text-center">
                💡 Chạm giữ vào ảnh bên trên để lưu vào Thư viện ảnh
              </p>

              <div className="w-full flex items-center gap-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chụp Kiểu Khác</span>
                </button>

                <button
                  onClick={() => downloadImageFile(savedPhotoboothUrl)}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Lưu / Chia Sẻ</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
