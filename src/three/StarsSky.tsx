import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSceneWeight } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

export function StarsSky() {
  const positions = useMemo(() => {
    const n = 1200;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 400 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.7);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  const matRef = useRef<THREE.PointsMaterial>(null);
  useFrame(() => {
    if (!matRef.current) return;
    const t = useJourney.getState().smoothProgress;
    const w = Math.max(getSceneWeight(t, "opening"), getSceneWeight(t, "transition") * 0.5);
    matRef.current.opacity = w;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} color={0xfff3d6} size={1.1} transparent opacity={0} sizeAttenuation={false} />
    </points>
  );
}
