'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, MapPin, Navigation, Phone, MessageCircle, 
  ExternalLink, Sparkles, Car, Calendar
} from 'lucide-react';
import { PARKING_LOCATIONS, GRADUATE_INFO } from '@/data/initialData';
import { SiteConfig, ContactPerson, ParkingLocation } from '@/types';

interface TimelineSectionProps {
  siteConfig?: SiteConfig | null;
}

export default function TimelineSection({ siteConfig }: TimelineSectionProps) {
  // Target: 10:30 ngày 14/11/2026 (GMT+7)
  const targetDateStr = siteConfig?.countdownTarget || '2026-11-14T10:30:00+07:00';
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const venue = siteConfig?.venueName || GRADUATE_INFO.venue;
  const address = siteConfig?.venueAddress || GRADUATE_INFO.address;
  const mapUrl = siteConfig?.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(venue + ', ' + address)}`;

  // Contacts
  const contacts: ContactPerson[] = siteConfig?.contacts && siteConfig.contacts.length > 0
    ? siteConfig.contacts
    : [
        { id: '1', name: 'Trí Nguyễn', phone: GRADUATE_INFO.phone, relation: 'Tân Cử Nhân' }
      ];

  // Parking locations (chỉ tên, mô tả, link maps)
  const parkingLocations = siteConfig?.parkingLocations && siteConfig.parkingLocations.length > 0
    ? siteConfig.parkingLocations
    : PARKING_LOCATIONS;

  return (
    <section id="timeline" className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 py-12 md:py-16">
      {/* Tiêu đề mục Sự Kiện */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#27A4F2] text-white border border-white/30 text-xs font-mono uppercase tracking-widest mb-2 shadow-md">
          <Clock className="w-3.5 h-3.5 text-white" />
          Thời Gian & Địa Điểm
        </div>
        <h2 className="font-serif text-[15px] sm:text-3xl md:text-4xl font-extrabold text-[#061C38] tracking-tight drop-shadow-sm whitespace-nowrap">
          THỜI KHẮC VINH DANH & HỘI TRƯỜNG
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#27A4F2] to-transparent mx-auto mt-2 rounded-full" />
      </div>

      {/* ĐỒNG HỒ ĐẾM NGƯỢC ĐẾN 10:30 NGÀY 14/11/2026 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-[#061C38] via-[#0B2545] to-[#27A4F2] rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-400/70 mb-10 text-white relative overflow-hidden"
        style={{
          boxShadow: '0 20px 40px -10px rgba(6, 28, 56, 0.4), 0 0 25px rgba(212, 175, 55, 0.25)',
        }}
      >
        <div className="washi-tape -top-2.5 right-8 rotate-3 text-[9px] font-bold text-navy-950 flex items-center justify-center uppercase">
          ★ COUNTDOWN ★
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase tracking-widest mb-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Thời khắc vinh danh trọng đại</span>
            </div>
            <h3 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight my-1">
              10:30 - 13:00
            </h3>
          </div>

          {/* 4 ô đếm ngược: Ngày, Giờ, Phút, Giây */}
          {!timeLeft.isOver ? (
            <div className="grid grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 text-center min-w-[62px] sm:min-w-[72px]">
                <div className="font-mono text-xl sm:text-3xl font-black text-amber-300 leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-300 mt-1">
                  Ngày
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 text-center min-w-[62px] sm:min-w-[72px]">
                <div className="font-mono text-xl sm:text-3xl font-black text-amber-300 leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-300 mt-1">
                  Giờ
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 text-center min-w-[62px] sm:min-w-[72px]">
                <div className="font-mono text-xl sm:text-3xl font-black text-amber-300 leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-300 mt-1">
                  Phút
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 text-center min-w-[62px] sm:min-w-[72px]">
                <div className="font-mono text-xl sm:text-3xl font-black text-amber-300 leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider text-slate-300 mt-1">
                  Giây
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-400/20 border border-amber-400 rounded-2xl px-5 py-3 text-amber-300 font-mono text-sm font-bold text-center">
              🎉 Giờ phút thiêng liêng đã diễn ra trọn vẹn!
            </div>
          )}
        </div>
      </motion.div>

      {/* ĐỊA ĐIỂM: NHẤN VÀO SẼ DẪN ĐẾN VỊ TRÍ TRÊN GOOGLE MAPS & DANH SÁCH LIÊN HỆ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-navy-900 font-bold bg-amber-100 px-2 py-0.5 rounded">
              ĐỊA ĐIỂM TỔ CHỨC
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 mt-1.5 mb-1">
              {venue}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {GRADUATE_INFO.university}
            </p>

            {/* Link click dẫn thẳng tới vị trí Google Maps */}
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-start gap-2 text-xs sm:text-sm text-blue-700 hover:text-blue-900 font-medium underline underline-offset-4 decoration-blue-400 hover:decoration-blue-600 transition-colors group cursor-pointer"
              title="Bấm để xem vị trí chính xác trên Google Maps"
            >
              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 group-hover:animate-bounce" />
              <span>{address}</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
            </a>
          </div>

          {/* LIÊN HỆ (CÓ THỂ NHIỀU SỐ ĐIỆN THOẠI, TÊN ỨNG VỚI TỪNG SỐ) */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-navy-900 font-bold bg-blue-100 px-2 py-0.5 rounded">
              LIÊN HỆ HỖ TRỢ KHI ĐẾN
            </span>
            <div className="mt-2 space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-navy-950 font-serif">
                      {contact.name}
                    </div>
                    {(contact.relation || (contact as any).note) && (
                      <div className="text-[10px] font-mono text-slate-500">
                        {contact.relation || (contact as any).note}
                      </div>
                    )}
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27A4F2] hover:bg-[#1E8FD5] text-white font-mono text-xs font-bold transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}

              <a
                href={GRADUATE_INFO.zalo}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-mono font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Tin Trực Tiếp Qua Zalo Với Trí</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* HƯỚNG DẪN CÁC VỊ TRÍ GIỮ XE (CHỈ TÊN, MÔ TẢ, LINK MAPS - BỎ LOẠI XE, PHÍ, MẸO) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-950">
              HƯỚNG DẪN CÁC VỊ TRÍ GIỮ XE
            </h3>
            <p className="text-xs text-[#27A4F2] font-semibold mt-1 flex items-center gap-1">
              <span>(Nhấn vào ô để mở google maps)</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 sm:text-right">
            Các bãi xe thuận tiện xung quanh địa điểm tổ chức.
          </p>
        </div>

        {/* Danh sách các bãi xe - Nhấn vào cả ô để mở Google Maps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {parkingLocations.map((loc, idx) => {
            const inner = (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#27A4F2] text-white font-bold font-mono text-xs flex items-center justify-center shadow-sm">
                    0{idx + 1}
                  </span>
                </div>

                <h4 className="font-serif text-base font-bold text-navy-950 mb-1.5 group-hover:text-[#27A4F2] transition-colors">
                  {loc.name}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {loc.description}
                </p>
              </div>
            );

            return loc.mapUrl ? (
              <a
                key={loc.id}
                href={loc.mapUrl}
                target="_blank"
                rel="noreferrer"
                title="Nhấn để mở Google Maps"
                className="group bg-slate-50 hover:bg-sky-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-[#27A4F2]/60 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                {inner}
              </a>
            ) : (
              <div
                key={loc.id}
                className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col justify-between"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
