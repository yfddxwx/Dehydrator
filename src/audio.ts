/**
 * Web Audio API 原生电子音效合成器
 * 100% 纯原生代码，严禁且不依赖任何外链音频文件
 */

class RetroAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 字符哈希算法，用于将脱水文本特征映射为和弦基调与频率
   */
  public hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & 0xffffffff;
    }
    return Math.abs(hash);
  }

  /**
   * 启动处理：播放短促、逐渐升调的电子脉冲序列（Arpeggio 琶音，方波/正弦波交织）
   */
  public playStartArpeggio(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // 6 音升调琶音基频序列 (基于复古 NeXT/DSP 风格微调)
      const baseFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
      const noteDuration = 0.048; // 每个脉冲 48ms

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.connect(ctx.destination);

      // 轻微低通滤波，过滤尖刺杂音，呈现 90s 模拟晶体管温润质感
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.connect(masterGain);

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const startTime = now + idx * noteDuration;
        const endTime = startTime + noteDuration * 1.3;

        // 方波与正弦波交织
        osc.type = idx % 2 === 0 ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // 脉冲包络：急速起振与短衰减
        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(0.4, startTime + 0.006);
        noteGain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (e) {
      console.warn('Web Audio Playback failed:', e);
    }
  }

  /**
   * 完成处理：根据输出文本字数哈希值，播放清脆、带轻微混响的泛音和弦（Chime）
   */
  public playFinishChime(text: string): { rootNote: string; chordType: string; hash: number } {
    const hash = this.hashString(text || 'dehydrated');

    // 预设 6 组悦耳的 90 年代晶体管大和弦与泛音配置
    const chordPalettes = [
      { name: 'C Maj9 (水晶和弦)', freqs: [523.25, 659.25, 783.99, 987.77, 1174.66] }, // C5, E5, G5, B5, D6
      { name: 'F Lydian (明亮泛音)', freqs: [698.46, 880.00, 987.77, 1318.51, 1567.98] }, // F5, A5, B5, E6, G6
      { name: 'G Sus4 (悬浮回响)', freqs: [392.00, 587.33, 783.99, 880.00, 1174.66] }, // G4, D5, G5, A5, D6
      { name: 'A Min7 (深空宁静)', freqs: [440.00, 523.25, 659.25, 783.99, 1046.50] }, // A4, C5, E5, G5, C6
      { name: 'D Maj7 (清澈微风)', freqs: [587.33, 739.99, 880.00, 1108.73, 1479.98] }, // D5, F#5, A5, C#6, F#6
      { name: 'E Pentatonic (禅意共鸣)', freqs: [659.25, 783.99, 880.00, 1174.66, 1318.51] }, // E5, G5, A5, D6, E6
    ];

    const selectedPalette = chordPalettes[hash % chordPalettes.length];

    if (!this.isMuted) {
      try {
        const ctx = this.initContext();
        const now = ctx.currentTime;

        // 混响延迟网络 (Feedback Delay Line)
        const delayNode = ctx.createDelay();
        delayNode.delayTime.setValueAtTime(0.18, now); // 180ms 延迟

        const delayGain = ctx.createGain();
        delayGain.gain.setValueAtTime(0.32, now); // 反馈衰减系数

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.22, now);

        // 线路互联：源 -> master，源 -> delay -> delayGain -> delay，delay -> master
        delayNode.connect(delayGain);
        delayGain.connect(delayNode);
        delayNode.connect(masterGain);
        masterGain.connect(ctx.destination);

        // 触发和弦中各个泛音频段
        selectedPalette.freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();

          // 泛音交错错开少许微毫秒（Strum 扫弦感）
          const strumOffset = idx * 0.024;
          const startTime = now + strumOffset;
          const duration = 1.35; // 持续 1.35 秒优雅淡出

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          // 晶体管风铃包络
          noteGain.gain.setValueAtTime(0.0001, startTime);
          noteGain.gain.linearRampToValueAtTime(0.28 / (idx * 0.4 + 1), startTime + 0.012);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(noteGain);
          noteGain.connect(masterGain);
          noteGain.connect(delayNode);

          osc.start(startTime);
          osc.stop(startTime + duration + 0.1);
        });
      } catch (e) {
        console.warn('Web Audio Chime failed:', e);
      }
    }

    return {
      rootNote: selectedPalette.freqs[0].toFixed(1) + 'Hz',
      chordType: selectedPalette.name,
      hash,
    };
  }
}

export const soundFx = new RetroAudioSynthesizer();
