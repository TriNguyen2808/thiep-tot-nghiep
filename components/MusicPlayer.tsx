'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';

interface MusicPlayerProps {
  isAutoPlayRequested?: boolean;
}

export default function MusicPlayer({ isAutoPlayRequested }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);

  // Mốc thời gian cắt 15 giây đầu theo yêu cầu
  const START_OFFSET_SECONDS = 15;
  const PRIMARY_AUDIO_SRC = '/audio/nhu-ngay-hom-qua.mp3';
  const FALLBACK_AUDIO_SRC = encodeURI('/audio/Như Ngày Hôm Qua - Sơn Tùng M-TP.mp3');

  // Hàm phát nhạc xuất phát từ giây thứ 15
  const playFromOffset = useCallback((offset = START_OFFSET_SECONDS) => {
    const audio = audioRef.current;
    if (!audio) return;

    const execute = () => {
      try {
        if (audio.currentTime < offset) {
          audio.currentTime = offset;
        }
      } catch (e) {
        console.warn('Set audio currentTime info:', e);
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            hasStartedRef.current = true;
          })
          .catch((err) => {
            console.warn('Autoplay restricted by browser, waiting for user touch:', err);
            // Nếu trình duyệt chặn phát tự động không có tương tác, phát ngay khi người dùng chạm vào màn hình
            const onUserGesture = () => {
              try {
                if (audio.currentTime < offset) {
                  audio.currentTime = offset;
                }
                audio
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    hasStartedRef.current = true;
                  })
                  .catch(console.warn);
              } catch (e) {
                console.warn(e);
              }
              window.removeEventListener('click', onUserGesture);
              window.removeEventListener('touchstart', onUserGesture);
              window.removeEventListener('scroll', onUserGesture);
            };

            window.addEventListener('click', onUserGesture, { once: true });
            window.addEventListener('touchstart', onUserGesture, { once: true });
            window.addEventListener('scroll', onUserGesture, { once: true });
          });
      }
    };

    if (audio.readyState >= 1) {
      execute();
    } else {
      audio.addEventListener('loadedmetadata', execute, { once: true });
      audio.addEventListener('canplay', execute, { once: true });
      execute();
    }
  }, [START_OFFSET_SECONDS]);

  // TỰ ĐỘNG PHÁT NGAY TỪ KHI VÀO LINK (Không cần đợi sau khi radio đếm ngược)
  useEffect(() => {
    if (!hasStartedRef.current) {
      playFromOffset(START_OFFSET_SECONDS);
    }

    const handleStartBgmEvent = () => {
      playFromOffset(START_OFFSET_SECONDS);
    };

    window.addEventListener('app:start-bgm', handleStartBgmEvent);

    return () => {
      window.removeEventListener('app:start-bgm', handleStartBgmEvent);
    };
  }, [playFromOffset, START_OFFSET_SECONDS]);

  // Bắt đầu lại từ giây 15 khi phát hết bài
  const handleEnded = () => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.currentTime = START_OFFSET_SECONDS;
        audio.play().catch(console.warn);
      } catch {
        audio.play().catch(console.warn);
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!hasStartedRef.current || audio.currentTime < START_OFFSET_SECONDS) {
        playFromOffset(START_OFFSET_SECONDS);
      } else {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => playFromOffset(START_OFFSET_SECONDS));
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    if (audio && audio.src !== FALLBACK_AUDIO_SRC) {
      console.log('Switching to fallback audio source...');
      audio.src = FALLBACK_AUDIO_SRC;
      audio.load();
      if (hasStartedRef.current) {
        playFromOffset(START_OFFSET_SECONDS);
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={PRIMARY_AUDIO_SRC}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Floating Audio Controller */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 bg-white/95 border-2 border-navy-800 backdrop-blur-md p-2 rounded-full shadow-2xl"
      >
        {/* Đĩa than xoay tròn khi phát */}
        <div
          onClick={togglePlay}
          className={`relative w-10 h-10 rounded-full bg-navy-950 p-1 border-2 border-amber-400 shadow-md flex items-center justify-center cursor-pointer group ${
            isPlaying ? 'animate-spin-vinyl' : ''
          }`}
          title={isPlaying ? 'Bấm để dừng nhạc' : 'Bấm để phát nhạc'}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-navy-950 flex items-center justify-center">
            <Disc className="w-2 h-2 text-navy-950" />
          </div>

          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
            )}
          </div>
        </div>

        <div className="hidden sm:block pr-1">
          <div className="flex items-center gap-1 text-[9px] font-mono text-navy-900 uppercase tracking-wider font-bold">
            <Music className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
            <span>Nhạc Nền Tốt Nghiệp</span>
          </div>
          <p
            className="text-[11px] font-serif font-bold text-navy-950 max-w-[170px] truncate"
            title="Như Ngày Hôm Qua - Sơn Tùng M-TP"
          >
            Như Ngày Hôm Qua - Sơn Tùng M-TP
          </p>
        </div>

        <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-slate-100 text-navy-900 transition-colors cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-navy-900" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-navy-900 transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
