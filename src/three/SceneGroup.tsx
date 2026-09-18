import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { getSceneWeight } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";
import type { SceneKey } from "../data/cameraPath";

/** يُظهر/يُخفي مجموعة عناصر 3D تدريجيًا بحسب اقتراب الكاميرا من فصلها في الرحلة */
export function SceneGroup({ scene, children }: { scene: SceneKey; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const t = useJourney.getState().smoothProgress;
    const w = getSceneWeight(t, scene);
    ref.current.visible = w > 0.01;
    const s = THREE.MathUtils.lerp(0.001, 1, w);
    ref.current.scale.setScalar(s);
  });

  return <group ref={ref}>{children}</group>;
}
