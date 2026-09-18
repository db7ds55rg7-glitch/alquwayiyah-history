import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { CAMERA_KEYS, type SceneKey } from "../data/cameraPath";
import { sampleCamera } from "../hooks/useCameraPath";
import { TERRAIN_PARAMS } from "../data/terrainParams";
import { PALETTES } from "../data/scenePalettes";

// PRNG بسيط وحتمي حتى تكون التضاريس متطابقة في كل مرة
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(1337);
const noise2D = createNoise2D(rng);

function fbm(x: number, z: number, octaves: number) {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let max = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise2D(x * freq, z * freq) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / max;
}

interface PathSample {
  x: number;
  y: number;
  z: number;
  scene: SceneKey;
}

function buildPathSamples(steps: number): PathSample[] {
  const out: PathSample[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = sampleCamera(t);
    out.push({ x: s.position.x, y: s.position.y, z: s.position.z, scene: s.scene });
  }
  return out;
}

let _cachedSamples: PathSample[] | null = null;
function getSamples(): PathSample[] {
  if (!_cachedSamples) _cachedSamples = buildPathSamples(140);
  return _cachedSamples;
}

function nearestSample(samples: PathSample[], X: number, Z: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < samples.length; i++) {
    const dx = samples[i].x - X;
    const dz = samples[i].z - Z;
    const d = dx * dx + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return { sample: samples[best], dist: Math.sqrt(bestD) };
}

// نصف قطر التمويج الغاوسي لدمج معطيات النقاط المتجاورة على المسار — يمنع الجروف
// الحادة حيث تمر أكثر من مرحلة زمنية فوق نفس البقعة الجغرافية (كعودة الحاضر فوق
// منطقة الافتتاح/الخريطة) بارتفاعات كاميرا مختلفة جدًا.
const BLEND_SIGMA = 22;
const BLEND_SIGMA2 = BLEND_SIGMA * BLEND_SIGMA;
// نصف قطر وهامش أمان يمنعان الأرض من الارتفاع فوق أي مسار كاميرا قريب مهما بلغ
// تعقيد المزج — يحمي من دخول الكاميرا داخل التضاريس حيث تتقاطع مرحلتان مكانيًا
// بارتفاعين مختلفين (مثل نهاية غصيبة القريبة من مدخل العقدة المرتفع).
const CEILING_RADIUS = 16;
const CEILING_RADIUS2 = CEILING_RADIUS * CEILING_RADIUS;
const SAFE_CLEARANCE = 3.2;

function heightAtDetailed(samples: PathSample[], X: number, Z: number) {
  let nearestDist = Infinity;
  let nearestScene: SceneKey = samples[0].scene;
  let sumW = 0;
  let floorY = 0;
  let amplitude = 0;
  let valleyHalfWidth = 0;
  let mountainStrength = 0;
  let ceiling = Infinity;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const dx = s.x - X;
    const dz = s.z - Z;
    const d2 = dx * dx + dz * dz;
    if (d2 < nearestDist) {
      nearestDist = d2;
      nearestScene = s.scene;
    }
    if (d2 < CEILING_RADIUS2) {
      const c = s.y - SAFE_CLEARANCE;
      if (c < ceiling) ceiling = c;
    }
    const w = Math.exp(-d2 / (2 * BLEND_SIGMA2));
    const p = TERRAIN_PARAMS[s.scene];
    sumW += w;
    floorY += w * (s.y - p.clearance);
    amplitude += w * p.amplitude;
    valleyHalfWidth += w * p.valleyHalfWidth;
    mountainStrength += w * p.mountainStrength;
  }

  nearestDist = Math.sqrt(nearestDist);
  floorY /= sumW;
  amplitude /= sumW;
  valleyHalfWidth /= sumW;
  mountainStrength /= sumW;
  floorY = Math.min(floorY, ceiling);

  const valleyFactor = THREE.MathUtils.smoothstep(nearestDist, 0, valleyHalfWidth);
  const bump = fbm(X * 0.045, Z * 0.045, 4) * amplitude * (1 - valleyFactor * 0.4);
  const ridge = Math.abs(fbm(X * 0.013, Z * 0.013, 3)) * mountainStrength * 30 * valleyFactor * valleyFactor;
  // صافي أمان نهائي: حتى تضاريس شديدة الوعورة قريبًا من المسار (كجدران الوادي) لا
  // يمكنها اختراق سقف الأمان المحسوب أعلاه مهما بلغت قوة الضجيج المحلي.
  const y = Number.isFinite(ceiling) ? Math.min(floorY + bump + ridge, ceiling + 1.1) : floorY + bump + ridge;
  return { y, scene: nearestScene, bump, amplitude };
}

/** ارتفاع الأرض عند أي نقطة (x,z) في العالم — لوضع عناصر أخرى فوق التضاريس بأمان */
export function getTerrainHeight(X: number, Z: number): number {
  return heightAtDetailed(getSamples(), X, Z).y;
}

export function getSceneAt(X: number, Z: number): SceneKey {
  return nearestSample(getSamples(), X, Z).sample.scene;
}

const _low = new THREE.Color();
const _high = new THREE.Color();
const _mix = new THREE.Color();
const _rock = new THREE.Color(0x4a4038);
const _sand = new THREE.Color(0xc9a877);

export interface JourneyTerrainResult {
  geometry: THREE.BufferGeometry;
}

export function buildJourneyTerrain(opts: {
  width: number;
  depth: number;
  segX: number;
  segZ: number;
  offsetZ: number;
}): JourneyTerrainResult {
  const { width, depth, segX, segZ, offsetZ } = opts;
  const samples = getSamples();

  const vertsX = segX + 1;
  const vertsZ = segZ + 1;
  const count = vertsX * vertsZ;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);

  let idx = 0;
  for (let iz = 0; iz < vertsZ; iz++) {
    const Z = -depth / 2 + (iz / segZ) * depth + offsetZ;
    for (let ix = 0; ix < vertsX; ix++) {
      const X = -width / 2 + (ix / segX) * width;
      const { y, scene, bump, amplitude } = heightAtDetailed(samples, X, Z);

      positions[idx * 3] = X;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = Z;

      const palette = PALETTES[scene];
      _low.copy(palette.colorLow);
      _high.copy(palette.colorHigh);
      const heightMix = THREE.MathUtils.clamp((bump / (amplitude || 1)) * 0.5 + 0.5, 0, 1);
      _mix.copy(_low).lerp(_high, heightMix);
      // مزج صخر/رمل خفيف للتنويع البصري
      const grain = (noise2D(X * 0.2, Z * 0.2) + 1) / 2;
      _mix.lerp(grain > 0.6 ? _rock : _sand, 0.12);

      colors[idx * 3] = _mix.r;
      colors[idx * 3 + 1] = _mix.g;
      colors[idx * 3 + 2] = _mix.b;

      uvs[idx * 2] = ix / segX;
      uvs[idx * 2 + 1] = iz / segZ;
      idx++;
    }
  }

  const indices: number[] = [];
  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * vertsX + ix;
      const b = a + 1;
      const c = a + vertsX;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return { geometry };
}

export function getKeySceneCount() {
  return CAMERA_KEYS.length;
}
