/** Plays a short referee-whistle tone using Web Audio API — no audio file needed. */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _ctx = new AC();
  }
  return _ctx;
}

export function playWhistle(): void {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') void ac.resume();

    const now = ac.currentTime;
    const dur = 0.48;

    const osc    = ac.createOscillator();
    const env    = ac.createGain();
    const lfo    = ac.createOscillator();
    const lfoAmt = ac.createGain();

    // Warble: 7 Hz LFO ±28 Hz on the carrier
    lfo.frequency.value = 7;
    lfoAmt.gain.value   = 28;
    lfo.connect(lfoAmt);
    lfoAmt.connect(osc.frequency);

    // Carrier: 3 100 → 3 300 → 3 200 Hz  (whistle pitch bend)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3100, now);
    osc.frequency.linearRampToValueAtTime(3300, now + 0.14);
    osc.frequency.linearRampToValueAtTime(3200, now + dur);

    // Envelope: sharp attack, flat sustain, quick decay
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.38, now + 0.014);
    env.gain.setValueAtTime(0.38, now + dur - 0.07);
    env.gain.linearRampToValueAtTime(0, now + dur);

    osc.connect(env);
    env.connect(ac.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + dur);
    osc.stop(now + dur);
  } catch {
    // audio blocked or unsupported — silently ignore
  }
}
