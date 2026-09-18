import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { getSceneWeight } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";
import { getTerrainHeight } from "./buildJourneyTerrain";

const STOPS = [
  { x: -55, z: -270, label: "التعدين القديم", era: "قبل الإسلام" },
  { x: -50, z: -190, label: "غصيبة", era: "الموطن الأول" },
  { x: -20, z: -28, label: "العقدة", era: "الموطن الثاني" },
  { x: 30, z: -35, label: "الحلة", era: "الموطن الثالث" },
  { x: 40, z: -34, label: "برج الرقيبة", era: "ق. ١١ هـ" },
  { x: 20, z: -20, label: "القويعية الحديثة", era: "اليوم" },
];

export function Timeline3D() {
  const groupRef = useRef<THREE.Group>(null);
  const [show, setShow] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = useJourney.getState().smoothProgress;
    const w = getSceneWeight(t, "timeline");
    groupRef.current.visible = w > 0.01;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((c, i) => {
      c.position.y = 14 + Math.sin(time * 0.6 + i) * 0.6;
      c.traverse((o) => {
        const mat = (o as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat && "opacity" in mat) mat.opacity = w;
      });
    });
    const shouldShow = w > 0.15;
    setShow((prev) => (prev !== shouldShow ? shouldShow : prev));
  });

  return (
    <group ref={groupRef}>
      {STOPS.map((s, i) => (
        <group key={i} position={[s.x, getTerrainHeight(s.x, s.z) + 14, s.z]}>
          <mesh>
            <octahedronGeometry args={[1.1, 0]} />
            <meshBasicMaterial color={0xe8c98a} transparent />
          </mesh>
          {show && (
            <Html distanceFactor={26} center style={{ pointerEvents: "none" }}>
              <div className="timeline-pin">
                <span className="timeline-pin-era">{s.era}</span>
                <span className="timeline-pin-label">{s.label}</span>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
