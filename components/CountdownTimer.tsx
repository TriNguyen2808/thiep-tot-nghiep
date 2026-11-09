'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Check, Bell } from 'lucide-react';
import { GRADUATE_INFO } from '@/data/initialData';

export default function CountdownTimer() {
  // Ngày tốt nghiệp: 14/11/2026 10:30
  const targetDate = new Date('2026-11-14T10:30:00+07:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Tạo link thêm sự kiện vào Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    'Lễ Tốt Nghiệp • Trí Nguyễn'
  )}&dates=20261114T033000Z/20261114T053000Z&details=${encodeURIComponent(
    'Lễ tốt nghiệp đại học của Trí Nguyễn. Rất mong bạn có mặt để cùng Trí lưu giữ khoảnh khắc thanh xuân đáng nhớ này!'
  )}&location=${encodeURIComponent(GRADUATE_INFO.venue + ', ' + GRADUATE_INFO.address)}`;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-gold/40 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
        {/* Washi tape trang trí */}
        <div className="washi-tape -top-3 left-1/2 -translate-x-1/2 !w-32 text-[10px] font-bold text-navy-950 flex items-center justify-center uppercase">
          ✦ COUNTDOWN ✦
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-mono text-gold uppercase tracking-widest mt-2 mb-4">
          <Clock className="w-4 h-4 text-gold" />
          <span>Đếm Ngược Đến Giờ Phút Vinh Danh</span>
        </div>

        {/* 4 Ô đếm ngược thời gian */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto mb-6">
          {[
            { label: 'NGÀY', value: timeLeft.days },
            { label: 'GIỜ', value: timeLeft.hours },
            { label: 'PHÚT', value: timeLeft.minutes },
            { label: 'GIÂY', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-navy-950/90 border border-slate-700/80 rounded-2xl p-2.5 sm:p-4 shadow-inner"
            >
              <span className="font-serif text-2xl sm:text-4xl font-black text-gold block">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] font-mono tracking-wider text-slate-400 mt-1 block">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Nút lưu vào Lịch cá nhân */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold hover:bg-yellow-400 text-navy-950 text-xs sm:text-sm font-bold font-sans transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Thêm Vào Google Calendar</span>
          </a>
        </div>
      </div>
    </div>
  );
}

