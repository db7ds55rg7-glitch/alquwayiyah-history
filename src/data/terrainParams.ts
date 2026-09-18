import type { SceneKey } from "./cameraPath";

export interface TerrainSceneParams {
  /** كم تكون الأرض أخفض من مسار الكاميرا عند هذه اللحظة (وحدات) */
  clearance: number;
  /** شدة التضاريس (الوعورة) */
  amplitude: number;
  /** نصف عرض الوادي قبل أن ترتفع الجبال الجانبية */
  valleyHalfWidth: number;
  /** حدة ارتفاع الجبال خارج الوادي */
  mountainStrength: number;
}

export const TERRAIN_PARAMS: Record<SceneKey, TerrainSceneParams> = {
  opening: { clearance: 60, amplitude: 16, valleyHalfWidth: 70, mountainStrength: 1.4 },
  map: { clearance: 40, amplitude: 18, valleyHalfWidth: 90, mountainStrength: 1.2 },
  transition: { clearance: 18, amplitude: 10, valleyHalfWidth: 45, mountainStrength: 1.1 },
  ghasaybah: { clearance: 5, amplitude: 2.2, valleyHalfWidth: 30, mountainStrength: 1.3 },
  uqdah: { clearance: 5, amplitude: 2.4, valleyHalfWidth: 30, mountainStrength: 1.3 },
  hillah: { clearance: 5, amplitude: 2.2, valleyHalfWidth: 28, mountainStrength: 1.3 },
  tower: { clearance: 6, amplitude: 5, valleyHalfWidth: 26, mountainStrength: 1.5 },
  wadi: { clearance: 4.5, amplitude: 11, valleyHalfWidth: 18, mountainStrength: 1.8 },
  ancient: { clearance: 4, amplitude: 7, valleyHalfWidth: 16, mountainStrength: 1.6 },
  mining: { clearance: 5, amplitude: 4, valleyHalfWidth: 20, mountainStrength: 1.2 },
  timeline: { clearance: 55, amplitude: 10, valleyHalfWidth: 60, mountainStrength: 1.1 },
  present: { clearance: 30, amplitude: 6, valleyHalfWidth: 65, mountainStrength: 0.9 },
};
