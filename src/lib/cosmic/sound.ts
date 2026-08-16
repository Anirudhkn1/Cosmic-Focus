/** Tiny WebAudio helper for mission cues. No assets, no external deps. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, gain: number): void {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export const cue = {
  launch(enabled: boolean) {
    if (!enabled) return;
    void audio()?.resume();
    tone(220, 0, 0.35, 0.06);
    tone(440, 0.12, 0.3, 0.05);
  },
  arrival(enabled: boolean) {
    if (!enabled) return;
    void audio()?.resume();
    tone(523.25, 0, 0.22, 0.06);
    tone(659.25, 0.16, 0.22, 0.06);
    tone(783.99, 0.32, 0.45, 0.06);
  },
  beep(enabled: boolean) {
    if (!enabled) return;
    void audio()?.resume();
    tone(880, 0, 0.16, 0.05);
    tone(880, 0.24, 0.16, 0.05);
  },
};
