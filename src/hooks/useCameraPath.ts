import * as THREE from "three";
import { CAMERA_KEYS, type SceneKey } from "../data/cameraPath";
import { PALETTES } from "../data/scenePalettes";

function catmullRomVec3(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number,
  out: THREE.Vector3
): THREE.Vector3 {
  const t2 = t * t;
  const t3 = t2 * t;
  const v0x = (p2.x - p0.x) * 0.5;
  const v0y = (p2.y - p0.y) * 0.5;
  const v0z = (p2.z - p0.z) * 0.5;
  const v1x = (p3.x - p1.x) * 0.5;
  const v1y = (p3.y - p1.y) * 0.5;
  const v1z = (p3.z - p1.z) * 0.5;
  out.x =
    (2 * p1.x - 2 * p2.x + v0x + v1x) * t3 +
    (-3 * p1.x + 3 * p2.x - 2 * v0x - v1x) * t2 +
    v0x * t +
    p1.x;
  out.y =
    (2 * p1.y - 2 * p2.y + v0y + v1y) * t3 +
    (-3 * p1.y + 3 * p2.y - 2 * v0y - v1y) * t2 +
    v0y * t +
    p1.y;
  out.z =
    (2 * p1.z - 2 * p2.z + v0z + v1z) * t3 +
    (-3 * p1.z + 3 * p2.z - 2 * v0z - v1z) * t2 +
    v0z * t +
    p1.z;
  return out;
}

const positions = CAMERA_KEYS.map((k) => new THREE.Vector3(...k.pos));
const looks = CAMERA_KEYS.map((k) => new THREE.Vector3(...k.look));

function clampIndex(i: number) {
  return Math.min(Math.max(i, 0), CAMERA_KEYS.length - 1);
}

function findSegment(t: number): { i: number; localT: number } {
  const keys = CAMERA_KEYS;
  if (t <= keys[0].t) return { i: 0, localT: 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i].t && t <= keys[i + 1].t) {
      const span = keys[i + 1].t - keys[i].t || 1;
      return { i, localT: (t - keys[i].t) / span };
    }
  }
  return { i: keys.length - 2, localT: 1 };
}

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export interface SampledCamera {
  position: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  scene: SceneKey;
  nextScene: SceneKey;
  sceneBlend: number;
}

export function sampleCamera(t: number): SampledCamera {
  const { i, localT } = findSegment(t);
  const p0 = positions[clampIndex(i - 1)];
  const p1 = positions[clampIndex(i)];
  const p2 = positions[clampIndex(i + 1)];
  const p3 = positions[clampIndex(i + 2)];
  catmullRomVec3(p0, p1, p2, p3, localT, _pos);

  const l0 = looks[clampIndex(i - 1)];
  const l1 = looks[clampIndex(i)];
  const l2 = looks[clampIndex(i + 1)];
  const l3 = looks[clampIndex(i + 2)];
  catmullRomVec3(l0, l1, l2, l3, localT, _look);

  const kA = CAMERA_KEYS[clampIndex(i)];
  const kB = CAMERA_KEYS[clampIndex(i + 1)];
  const fov = THREE.MathUtils.lerp(kA.fov, kB.fov, localT);

  return {
    position: _pos.clone(),
    look: _look.clone(),
    fov,
    scene: kA.scene,
    nextScene: kB.scene,
    sceneBlend: localT,
  };
}

// === مزج الباليتات بين المشاهد بسلاسة عبر كامل الرحلة ===
const SCENE_ANCHORS: { scene: SceneKey; t: number }[] = (() => {
  const groups = new Map<SceneKey, number[]>();
  CAMERA_KEYS.forEach((k) => {
    if (!groups.has(k.scene)) groups.set(k.scene, []);
    groups.get(k.scene)!.push(k.t);
  });
  const list: { scene: SceneKey; t: number }[] = [];
  groups.forEach((ts, scene) => {
    const avg = ts.reduce((a, b) => a + b, 0) / ts.length;
    list.push({ scene, t: avg });
  });
  list.sort((a, b) => a.t - b.t);
  return list;
})();

export interface BlendedPalette {
  colorLow: THREE.Color;
  colorHigh: THREE.Color;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  ambient: number;
  desaturation: number;
  particleDensity: number;
  particleColor: THREE.Color;
  exposure: number;
}

const _blend: BlendedPalette = {
  colorLow: new THREE.Color(),
  colorHigh: new THREE.Color(),
  fogColor: new THREE.Color(),
  fogNear: 10,
  fogFar: 100,
  sunColor: new THREE.Color(),
  sunIntensity: 1,
  ambient: 0.2,
  desaturation: 0,
  particleDensity: 0.3,
  particleColor: new THREE.Color(),
  exposure: 1,
};

export function samplePalette(t: number): BlendedPalette {
  let ai = 0;
  for (let i = 0; i < SCENE_ANCHORS.length - 1; i++) {
    if (t >= SCENE_ANCHORS[i].t && t <= SCENE_ANCHORS[i + 1].t) {
      ai = i;
      break;
    }
    if (t > SCENE_ANCHORS[SCENE_ANCHORS.length - 1].t) ai = SCENE_ANCHORS.length - 2;
  }
  const a = SCENE_ANCHORS[Math.max(0, ai)];
  const b = SCENE_ANCHORS[Math.min(SCENE_ANCHORS.length - 1, ai + 1)];
  const span = b.t - a.t || 1;
  let f = (t - a.t) / span;
  f = THREE.MathUtils.clamp(f, 0, 1);
  f = f * f * (3 - 2 * f); // smoothstep

  const pa = PALETTES[a.scene];
  const pb = PALETTES[b.scene];

  _blend.colorLow.copy(pa.colorLow).lerp(pb.colorLow, f);
  _blend.colorHigh.copy(pa.colorHigh).lerp(pb.colorHigh, f);
  _blend.fogColor.copy(pa.fogColor).lerp(pb.fogColor, f);
  _blend.fogNear = THREE.MathUtils.lerp(pa.fogNear, pb.fogNear, f);
  _blend.fogFar = THREE.MathUtils.lerp(pa.fogFar, pb.fogFar, f);
  _blend.sunColor.copy(pa.sunColor).lerp(pb.sunColor, f);
  _blend.sunIntensity = THREE.MathUtils.lerp(pa.sunIntensity, pb.sunIntensity, f);
  _blend.ambient = THREE.MathUtils.lerp(pa.ambient, pb.ambient, f);
  _blend.desaturation = THREE.MathUtils.lerp(pa.desaturation, pb.desaturation, f);
  _blend.particleDensity = THREE.MathUtils.lerp(pa.particleDensity, pb.particleDensity, f);
  _blend.particleColor.copy(pa.particleColor).lerp(pb.particleColor, f);
  _blend.exposure = THREE.MathUtils.lerp(pa.exposure, pb.exposure, f);

  return _blend;
}

export function getSceneWeight(t: number, scene: SceneKey): number {
  // مدى ظهور مجموعة عناصر مشهد معيّن (لتلاشي دخول/خروج كل بيئة)
  const keysOfScene = CAMERA_KEYS.filter((k) => k.scene === scene);
  if (keysOfScene.length === 0) return 0;
  const tStart = keysOfScene[0].t;
  const tEnd = keysOfScene[keysOfScene.length - 1].t;
  const fadeIn = 0.03;
  const fadeOut = 0.03;
  if (t < tStart - fadeIn || t > tEnd + fadeOut) return 0;
  if (t < tStart) return THREE.MathUtils.smoothstep(t, tStart - fadeIn, tStart);
  if (t > tEnd) return 1 - THREE.MathUtils.smoothstep(t, tEnd, tEnd + fadeOut);
  return 1;
}
