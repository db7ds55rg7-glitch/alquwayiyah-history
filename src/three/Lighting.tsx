import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { samplePalette } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

export function Lighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

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
    if (hemiRef.current) {
      // إضاءة سماء/أرض (Hemisphere) بدل الإضاءة المحيطية المسطحة — تعطي تدرجًا
      // طبيعيًا بين ضوء السماء الدافئ وانعكاس الأرض، فتساعد الأسطح المنخفضة
      // (كالأبواب وقواعد الصخور) تبدو مغمورة بالبيئة لا مسطحة بلا عمق.
      hemiRef.current.color.copy(p.sunColor);
      hemiRef.current.groundColor.copy(p.colorLow);
      hemiRef.current.intensity = p.ambient * 1.6;
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
      <hemisphereLight ref={hemiRef} />
    </>
  );
}
