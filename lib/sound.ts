// Web Audio API Synthesizer & Sound Effects
// Tự tạo âm thanh nội bộ, 100% không phụ thuộc mạng, không bao giờ bị lỗi 404/CORS

class SoundFX {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmInterval: NodeJS.Timeout | null = null;

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Tiếng nhạc vui vẻ mở đầu của Loa Phát Thanh (Upbeat Celebration Tune / Fanfare)
  playCheerfulFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Đoạn nhạc jingle vui tươi rộn rã (Đô - Mi - Sol - Đố - Si - Đố)
      // C5, E5, G5, C6, B5, C6
      const melody = [
        { freq: 523.25, time: 0, dur: 0.18 },
        { freq: 659.25, time: 0.18, dur: 0.18 },
        { freq: 783.99, time: 0.36, dur: 0.18 },
        { freq: 1046.5, time: 0.54, dur: 0.35 },
        { freq: 987.77, time: 0.90, dur: 0.18 },
        { freq: 1046.5, time: 1.08, dur: 0.55 },
      ];

      melody.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Âm sắc kèn đồng / chuông vui tươi (triangle + square)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.25, now + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch (e) {
      console.warn('Fanfare error:', e);
    }
  }

  // 2. Tiếng mở thư lụa sột soạt kèm chuông ngân
  playOpenLetter() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }

      const paper = ctx.createBufferSource();
      paper.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      paper.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      paper.start(now);

      // Chuông ngân hoài niệm
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1174.66, now + 0.1);
      chime.frequency.exponentialRampToValueAtTime(1760, now + 0.5);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now + 0.1);
      chime.stop(now + 1.3);
    } catch (e) {
      console.warn('Open letter sound error:', e);
    }
  }

  playCloseLetter() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Close letter sound error:', e);
    }
  }

  // 3. Pháo hoa chúc mừng
  playCelebration() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch (e) {
      console.warn('Celebration sound error:', e);
    }
  }

  // Tiếng chớp chụp ảnh cơ học (Camera shutter click)
  playCameraClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Click 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // Click 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, now + 0.07);
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.14);
      gain2.gain.setValueAtTime(0.25, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.15);
    } catch (e) {
      console.warn('Camera click sound error:', e);
    }
  }

  // 4. Nhạc nền Piano Lofi bài "Giữ anh cho ngày hôm qua" được Synth trực tiếp
  // Đảm bảo LUÔN LUÔN CÓ TIẾNG, không phụ thuộc file mp3 hay mạng internet!
  startSynthBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isBgmPlaying = true;

    // Giai điệu mộc mạc của "Giữ anh cho ngày hôm qua" (Acoustic Piano)
    // Nốt nhạc: D4, F#4, A4, B4, A4, F#4, E4, D4...
    const notes = [
      { f: 293.66, d: 0.6 }, // D4
      { f: 369.99, d: 0.6 }, // F#4
      { f: 440.00, d: 0.8 }, // A4
      { f: 493.88, d: 0.6 }, // B4
      { f: 440.00, d: 0.8 }, // A4
      { f: 369.99, d: 0.6 }, // F#4
      { f: 329.63, d: 0.8 }, // E4
      { f: 293.66, d: 1.2 }, // D4

      { f: 329.63, d: 0.6 }, // E4
      { f: 369.99, d: 0.6 }, // F#4
      { f: 440.00, d: 0.8 }, // A4
      { f: 369.99, d: 0.6 }, // F#4
      { f: 329.63, d: 0.8 }, // E4
      { f: 293.66, d: 1.4 }, // D4
    ];

    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isBgmPlaying) return;
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const note = notes[noteIndex];
      const now = currentCtx.currentTime;

      // 1. Piano tone (Sine + Subtle Triangle)
      const osc = currentCtx.createOscillator();
      const gain = currentCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.d * 1.5);

      osc.connect(gain);
      gain.connect(currentCtx.destination);

      osc.start(now);
      osc.stop(now + note.d * 1.5);

      noteIndex = (noteIndex + 1) % notes.length;
      this.bgmInterval = setTimeout(playNextNote, note.d * 750);
    };

    playNextNote();
  }

  stopSynthBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleSynthBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopSynthBgm();
      return false;
    } else {
      this.startSynthBgm();
      return true;
    }
  }

  getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }
}

export const soundFX = new SoundFX();
