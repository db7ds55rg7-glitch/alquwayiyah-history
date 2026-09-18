// محرك صوت محيطي توليدي (Web Audio API) — بلا ملفات صوتية خارجية أو موسيقى محمية بحقوق نشر.
// يولّد ضجيج رياح ناعم + طبقة "درون" صحراوية منخفضة، شدتهما تتغيران مع تقدم الرحلة.

let ctx: AudioContext | null = null;
let windGain: GainNode | null = null;
let droneGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let started = false;

function createNoiseBuffer(audioCtx: AudioContext) {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function startAmbient() {
  if (started) {
    ctx?.resume();
    return;
  }
  started = true;
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  masterGain = ctx.createGain();
  masterGain.gain.value = 0.0001;
  masterGain.connect(ctx.destination);
  masterGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 2.5);

  // طبقة الرياح: ضجيج مُرشَّح
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx);
  noise.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 500;
  windFilter.Q.value = 0.6;
  windGain = ctx.createGain();
  windGain.gain.value = 0.5;
  noise.connect(windFilter).connect(windGain).connect(masterGain);
  noise.start();

  // تذبذب بطيء لتردد الرياح لإحساس طبيعي
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain).connect(windFilter.frequency);
  lfo.start();

  // طبقة الدرون الصحراوية المنخفضة
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 55;
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 82.4;
  droneGain = ctx.createGain();
  droneGain.gain.value = 0.35;
  osc1.connect(droneGain);
  osc2.connect(droneGain);
  droneGain.connect(masterGain);
  osc1.start();
  osc2.start();
}

export function stopAmbient() {
  if (!ctx || !masterGain) return;
  masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
  setTimeout(() => {
    ctx?.suspend();
  }, 1300);
}

/** تُستدعى كل إطار تقريبًا لضبط شدة الطبقات بحسب مرحلة الرحلة */
export function updateAmbient(params: { windIntensity: number; droneIntensity: number }) {
  if (!ctx || !windGain || !droneGain) return;
  const now = ctx.currentTime;
  windGain.gain.setTargetAtTime(0.15 + params.windIntensity * 0.55, now, 0.4);
  droneGain.gain.setTargetAtTime(0.1 + params.droneIntensity * 0.35, now, 0.6);
}
