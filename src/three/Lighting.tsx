import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { samplePalette } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

export function Lighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);

  useFrame(({ camera }) => {
    const t = useJourney.getState().smoothProgress;
    const p = samplePalette(t);
    if (sunRef.current) {
      sunRef.current.color.copy(p.sunColor);
      sunRef.current.intensity = p.sunIntensity * 1.4;
      sunRef.current.position.set(camera.position.x + 60, camera.position.y + 90, camera.position.z + 40);
      sunRef.current.target.position.set(camera.position.x, camera.position.y, camera.position.z);
      sunRef.current.target.updateMatrixWorld();
    }
    if (ambRef.current) {
      ambRef.current.color.copy(p.sunColor);
      ambRef.current.intensity = p.ambient * 1.2;
    }
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0015}
        shadow-normalBias={0.35}
      >
        <orthographicCamera attach="shadow-camera" args={[-80, 80, 80, -80, 1, 260]} />
      </directionalLight>
      <ambientLight ref={ambRef} />
    </>
  );
}
