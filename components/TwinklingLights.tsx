'use client';

import React, { useMemo } from 'react';

export default function TwinklingLights() {
  const orbs = useMemo(() => {
    return [
      { id: 1, top: '6%', left: '10%', size: 95, color: 'rgba(255, 255, 255, 0.45)', blur: 'blur-md', dur: 6, delay: 0 },
      { id: 2, top: '14%', left: '76%', size: 140, color: 'rgba(255, 255, 255, 0.38)', blur: 'blur-xl', dur: 8, delay: 1.2 },
      { id: 3, top: '26%', left: '20%', size: 70, color: 'rgba(255, 255, 255, 0.5)', blur: 'blur-sm', dur: 5, delay: 2.1 },
      { id: 4, top: '34%', left: '86%', size: 110, color: 'rgba(255, 255, 255, 0.4)', blur: 'blur-lg', dur: 7, delay: 0.5 },
      { id: 5, top: '46%', left: '5%', size: 130, color: 'rgba(255, 255, 255, 0.32)', blur: 'blur-xl', dur: 9, delay: 3 },
      { id: 6, top: '54%', left: '82%', size: 80, color: 'rgba(255, 255, 255, 0.55)', blur: 'blur-md', dur: 5.5, delay: 1.8 },
      { id: 7, top: '66%', left: '14%', size: 150, color: 'rgba(255, 255, 255, 0.3)', blur: 'blur-2xl', dur: 8.5, delay: 2.5 },
      { id: 8, top: '74%', left: '88%', size: 85, color: 'rgba(255, 255, 255, 0.45)', blur: 'blur-md', dur: 6.5, delay: 0.8 },
      { id: 9, top: '84%', left: '28%', size: 120, color: 'rgba(255, 255, 255, 0.4)', blur: 'blur-lg', dur: 7.5, delay: 3.2 },
      { id: 10, top: '92%', left: '70%', size: 100, color: 'rgba(255, 255, 255, 0.42)', blur: 'blur-md', dur: 6, delay: 1.5 },
      { id: 11, top: '4%', left: '48%', size: 75, color: 'rgba(255, 255, 255, 0.4)', blur: 'blur-sm', dur: 5.8, delay: 2 },
      { id: 12, top: '40%', left: '50%', size: 60, color: 'rgba(255, 255, 255, 0.6)', blur: 'blur-[2px]', dur: 4.8, delay: 0.3 },
      { id: 13, top: '60%', left: '40%', size: 160, color: 'rgba(255, 255, 255, 0.28)', blur: 'blur-2xl', dur: 9.5, delay: 1 },
      { id: 14, top: '20%', left: '2%', size: 105, color: 'rgba(255, 255, 255, 0.35)', blur: 'blur-lg', dur: 7.2, delay: 2.8 },
      { id: 15, top: '78%', left: '4%', size: 65, color: 'rgba(255, 255, 255, 0.52)', blur: 'blur-sm', dur: 5.2, delay: 1.4 },
      { id: 16, top: '95%', left: '42%', size: 115, color: 'rgba(255, 255, 255, 0.35)', blur: 'blur-xl', dur: 8, delay: 2.2 },
    ];
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full ${orb.blur} animate-orb-glow`}
          style={{
            top: orb.top,
            left: orb.left,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle, ${orb.color} 0%, rgba(255,255,255,0.2) 50%, transparent 75%)`,
            boxShadow: `0 0 ${orb.size / 2}px ${orb.color}`,
            animationDuration: `${orb.dur}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
