/**
 * FAIRPLAY — Whistle sound library
 * 10 distinct referee whistle types synthesised with Web Audio API.
 * No audio files required — works fully offline.
 */

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') void _ctx.resume();
  return _ctx;
}

// ── Whistle type metadata ────────────────────────────────────────────────────

export interface WhistleType {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const WHISTLE_TYPES: WhistleType[] = [
  {
    id: 'classic',
    name: 'Fox 40 Classic',
    description: "Pealess Fox 40 warble — the world's most recognised referee whistle",
    emoji: '📯',
  },
  {
    id: 'single',
    name: 'Single Tweet',
    description: 'One crisp, clean blast — perfect for quick decisions',
    emoji: '🔔',
  },
  {
    id: 'double',
    name: 'Double Blast',
    description: 'Two rapid bursts — the classic half-time signal',
    emoji: '🔔🔔',
  },
  {
    id: 'triple',
    name: 'Triple Burst',
    description: 'Three sharp tweets — full-time or major stoppage',
    emoji: '🔔🔔🔔',
  },
  {
    id: 'pealess',
    name: 'Pealess Pro',
    description: 'Ultra-bright, two-tone pealess whistle used in top-flight matches',
    emoji: '⚡',
  },
  {
    id: 'longblast',
    name: 'Long Blast',
    description: 'Sustained rising blast — dramatic penalty or red card emphasis',
    emoji: '📢',
  },
  {
    id: 'airhorn',
    name: 'Air Horn',
    description: 'Deep, powerful stadium air horn — impossible to ignore',
    emoji: '📣',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'Digital pulse beep — modern FIFA-style electronic whistle',
    emoji: '🤖',
  },
  {
    id: 'training',
    name: 'Training Whistle',
    description: 'Soft triple tweet — subtle enough for training sessions',
    emoji: '🎓',
  },
  {
    id: 'oldschool',
    name: 'Old School Brass',
    description: "Lower-frequency classic brass whistle from football's earliest days",
    emoji: '🎺',
  },
];

// ── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fp_whistle';

export function getSavedWhistleId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'classic';
}

export function saveWhistleId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

// ── Synth helpers ────────────────────────────────────────────────────────────

/** Build one sine tone with an ADSR envelope and optional LFO vibrato */
function makeTone(
  ac: AudioContext,
  startTime: number,
  duration: number,
  startFreq: number,
  endFreq: number,
  peakGain: number,
  attackTime = 0.014,
  decayTime  = 0.07,
  lfoFreq    = 0,
  lfoDepth   = 0,
): GainNode {
  const osc = ac.createOscillator();
  const env = ac.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, startTime);
  if (endFreq !== startFreq) {
    osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
  }

  if (lfoFreq > 0) {
    const lfo    = ac.createOscillator();
    const lfoAmt = ac.createGain();
    lfo.frequency.value = lfoFreq;
    lfoAmt.gain.value   = lfoDepth;
    lfo.connect(lfoAmt);
    lfoAmt.connect(osc.frequency);
    lfo.start(startTime);
    lfo.stop(startTime + duration);
  }

  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
  env.gain.setValueAtTime(peakGain, startTime + duration - decayTime);
  env.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(env);
  osc.start(startTime);
  osc.stop(startTime + duration);

  return env;
}

// ── Whistle implementations ──────────────────────────────────────────────────

function playClassic(ac: AudioContext): void {
  // Fox 40 pealess: pitch-bend 3100→3300 Hz + 7 Hz warble
  const n = makeTone(ac, ac.currentTime, 0.48, 3100, 3200, 0.38, 0.014, 0.07, 7, 28);
  n.connect(ac.destination);
}

function playSingle(ac: AudioContext): void {
  const n = makeTone(ac, ac.currentTime, 0.30, 3400, 3400, 0.40, 0.010, 0.06);
  n.connect(ac.destination);
}

function playDouble(ac: AudioContext): void {
  const now = ac.currentTime;
  [0, 0.30].forEach((offset) => {
    const n = makeTone(ac, now + offset, 0.22, 3400, 3400, 0.40, 0.010, 0.04);
    n.connect(ac.destination);
  });
}

function playTriple(ac: AudioContext): void {
  const now = ac.currentTime;
  [0, 0.26, 0.52].forEach((offset) => {
    const n = makeTone(ac, now + offset, 0.18, 3400, 3400, 0.40, 0.010, 0.035);
    n.connect(ac.destination);
  });
}

function playPealess(ac: AudioContext): void {
  // Dual-tone chord: fundamental 3800 Hz + fifth 5700 Hz — very piercing
  const now = ac.currentTime;
  const n1 = makeTone(ac, now, 0.42, 3800, 3900, 0.28, 0.012, 0.06);
  const n2 = makeTone(ac, now, 0.42, 5700, 5700, 0.12, 0.012, 0.06);
  n1.connect(ac.destination);
  n2.connect(ac.destination);
}

function playLongBlast(ac: AudioContext): void {
  // Sustained rising pitch with gentle warble
  const n = makeTone(ac, ac.currentTime, 0.90, 2900, 3400, 0.36, 0.020, 0.12, 5, 18);
  n.connect(ac.destination);
}

function playAirhorn(ac: AudioContext): void {
  const now = ac.currentTime;
  const dur = 0.60;

  // Sawtooth duo for that horn buzz
  const osc  = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const env  = ac.createGain();
  const dist = ac.createWaveShaper();

  // Mild distortion for rasp
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i * 2) / 256 - 1;
    curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
  }
  dist.curve = curve;

  osc.type  = 'sawtooth'; osc.frequency.value  = 220;
  osc2.type = 'sawtooth'; osc2.frequency.value = 293;

  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.22, now + 0.04);
  env.gain.setValueAtTime(0.22, now + dur - 0.10);
  env.gain.linearRampToValueAtTime(0, now + dur);

  osc.connect(dist); osc2.connect(dist);
  dist.connect(env);
  env.connect(ac.destination);

  osc.start(now);  osc2.start(now);
  osc.stop(now + dur); osc2.stop(now + dur);
}

function playElectronic(ac: AudioContext): void {
  // Three crisp digital square-wave pulses
  const now = ac.currentTime;
  for (let i = 0; i < 3; i++) {
    const start = now + i * 0.18;
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = 1200;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(0.18, start + 0.008);
    env.gain.setValueAtTime(0.18, start + 0.10);
    env.gain.linearRampToValueAtTime(0, start + 0.13);
    osc.connect(env);
    env.connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.14);
  }
}

function playTraining(ac: AudioContext): void {
  // Three soft, lower-pitch tweets spaced gently apart
  const now = ac.currentTime;
  [0, 0.22, 0.44].forEach((offset) => {
    const n = makeTone(ac, now + offset, 0.15, 2800, 2800, 0.22, 0.010, 0.04);
    n.connect(ac.destination);
  });
}

function playOldSchool(ac: AudioContext): void {
  // Classic brass: lower frequency + harmonic for metallic timbre
  const now = ac.currentTime;
  const dur = 0.55;
  const n1 = makeTone(ac, now, dur, 1800, 2000, 0.35, 0.020, 0.10, 6, 14);
  const n2 = makeTone(ac, now, dur, 3600, 4000, 0.12, 0.020, 0.10, 6, 8);
  n1.connect(ac.destination);
  n2.connect(ac.destination);
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Play the whistle identified by `id`. Omit `id` to use the saved preference. */
export function playWhistle(id?: string): void {
  try {
    const ac = getCtx();
    const whistleId = id ?? getSavedWhistleId();
    switch (whistleId) {
      case 'single':     playSingle(ac);     break;
      case 'double':     playDouble(ac);     break;
      case 'triple':     playTriple(ac);     break;
      case 'pealess':    playPealess(ac);    break;
      case 'longblast':  playLongBlast(ac);  break;
      case 'airhorn':    playAirhorn(ac);    break;
      case 'electronic': playElectronic(ac); break;
      case 'training':   playTraining(ac);   break;
      case 'oldschool':  playOldSchool(ac);  break;
      default:           playClassic(ac);    break;
    }
  } catch {
    // audio blocked or unsupported — silently ignore
  }
}
