'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RadioIntro from '@/components/RadioIntro';
import InvitationCard from '@/components/InvitationCard';
import SecretLetterModal from '@/components/SecretLetterModal';
import CheckinModal from '@/components/CheckinModal';
import TimelineSection from '@/components/TimelineSection';
import GallerySection from '@/components/GallerySection';
import GuestbookSection from '@/components/GuestbookSection';
import MusicPlayer from '@/components/MusicPlayer';
import TwinklingLights from '@/components/TwinklingLights';
import Footer from '@/components/Footer';
import { SiteConfig, GuestItem } from '@/types';

function GraduationInvitationContent() {
  const searchParams = useSearchParams();
  const [showRadioIntro, setShowRadioIntro] = useState(true);
  const [showSecretLetter, setShowSecretLetter] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [guestId, setGuestId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [secretLetterText, setSecretLetterText] = useState<string>('');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isMusicRequested, setIsMusicRequested] = useState(true); // Tự động phát ngay từ đầu

  // Tải cấu hình dữ liệu từ Admin API
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const res = await fetch('/api/admin/data');
        const json = await res.json();
        if (json.success && json.data) {
          setSiteConfig(json.data);
          return;
        }
      } catch (err) {
        console.warn('Lỗi khi tải cấu hình siteConfig từ server:', err);
      }

      // Fallback từ localStorage nếu có
      try {
        const local = localStorage.getItem('tri_site_config');
        if (local) {
          setSiteConfig(JSON.parse(local));
        }
      } catch (e) {
        console.warn(e);
      }
    };

    loadSiteConfig();
  }, []);

  // Xử lý thông tin khách mời từ URL parameters
  useEffect(() => {
    const idParam = searchParams.get('id') || searchParams.get('guestId');
    const nameParam = searchParams.get('to') || searchParams.get('name') || searchParams.get('guest');

    if (idParam) {
      setGuestId(idParam);
    }

    if (nameParam) {
      const decodedName = decodeURIComponent(nameParam.replace(/_/g, ' '));
      setGuestName(decodedName);
    }
    // Không tự động mở thư bí mật khi truy cập - chỉ mở khi khách nhấn vào nút "Mở Thư Bí Mật"
  }, [searchParams]);

  // Cập nhật thông tin khách khi siteConfig hoặc guestId/guestName thay đổi
  useEffect(() => {
    if (siteConfig?.guests && siteConfig.guests.length > 0) {
      let matched: GuestItem | undefined;
      if (guestId) {
        matched = siteConfig.guests.find((g) => g.id === guestId);
      }
      if (!matched && guestName) {
        matched = siteConfig.guests.find((g) => g.name.toLowerCase().trim() === guestName.toLowerCase().trim());
      }

      if (matched) {
        if (!guestName) setGuestName(matched.name);
        if (matched.secretLetter) {
          setSecretLetterText(matched.secretLetter);
        }
      }
    }
  }, [siteConfig, guestId, guestName]);

  const handleOpenStart = () => {
    setIsMusicRequested(true);
  };

  const handleRadioComplete = () => {
    setShowRadioIntro(false);
    setIsMusicRequested(true);
  };

  const handleReplayRadio = () => {
    setShowRadioIntro(true);
  };

  return (
    <main className="relative min-h-screen bg-[#6EC2F7] text-slate-900 selection:bg-amber-400 selection:text-navy-950 overflow-x-hidden">
      {/* Hiệu ứng đốm sáng, vệt sáng tròn nhẹ nhàng */}
      <TwinklingLights />

      {/* 1. Mở đầu bằng Chiếc Radio cổ điển Y2K */}
      {showRadioIntro && (
        <RadioIntro
          onComplete={handleRadioComplete}
          onOpenStart={handleOpenStart}
          guestName={guestName}
        />
      )}

      {/* 2. Thiệp Mời Tốt Nghiệp Chính Thức */}
      <InvitationCard
        guestName={guestName}
        guestId={guestId}
        siteConfig={siteConfig}
        onOpenSecretLetter={() => setShowSecretLetter(true)}
        onOpenCheckin={() => setShowCheckinModal(true)}
      />

      {/* 3. Màn hình Checkin Photobooth Camera 9:16 (Lưu vào dự án & hỗ trợ iOS / Android) */}
      <CheckinModal
        isOpen={showCheckinModal}
        onClose={() => setShowCheckinModal(false)}
        guestName={guestName}
      />

      {/* 4. Thư Bí Mật Dành Riêng Cho Bạn Thân (Chỉ hiển thị trước 14/11/2026 khi có thư) */}
      <SecretLetterModal
        isOpen={showSecretLetter}
        onClose={() => setShowSecretLetter(false)}
        guestName={guestName}
        customLetterText={secretLetterText}
      />

      {/* 5. Screen Timeline (Đồng hồ đếm ngược đến 10:30 ngày 14/11/2026, địa chỉ Maps, nhiều số liên hệ, bãi xe) */}
      <TimelineSection siteConfig={siteConfig} />

      {/* 6. Screen Bộ Sưu Tập Những Khoảnh Khắc Đẹp Tại Trường (Mobile xem 2 album trên 1 hàng) */}
      <GallerySection collections={siteConfig?.collections} />

      {/* 7. Screen Gửi Lời Chúc (Form bên trái + Feed màn hình mô phỏng điện thoại lướt xem các lời chúc) */}
      <GuestbookSection />

      {/* 8. Floating Music Player (Tự động phát từ khi vào link) */}
      <MusicPlayer isAutoPlayRequested={isMusicRequested} />

      {/* 9. Footer & Nút xem lại Radio */}
      <Footer onReplayRadio={handleReplayRadio} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#6EC2F7] text-navy-950 font-serif">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-navy-950 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-navy-900 font-bold font-mono">Đang tải thiệp mời...</p>
        </div>
      </div>
    }>
      <GraduationInvitationContent />
    </Suspense>
  );
}
