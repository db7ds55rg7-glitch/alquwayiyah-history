import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { getSceneWeight } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

const MARKERS = [
  { pos: [90, 10, 10] as [number, number, number], label: "المملكة العربية السعودية", sub: "" },
  { pos: [35, 6, 5] as [number, number, number], label: "منطقة الرياض", sub: "" },
  { pos: [0, 3.5, 0] as [number, number, number], label: "محافظة القويعية", sub: "وادي القويع" },
];

export function MapMarkers() {
  const groupRef = useRef<THREE.Group>(null);
  const [show, setShow] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = useJourney.getState().smoothProgress;
    const w = getSceneWeight(t, "map");
    groupRef.current.visible = w > 0.01;
    groupRef.current.children.forEach((c) => {
      c.traverse((o) => {
        if ((o as THREE.Mesh).material) {
          const mat = (o as THREE.Mesh).material as THREE.MeshBasicMaterial;
          if ("opacity" in mat) mat.opacity = w;
        }
      });
    });
    const shouldShow = w > 0.15;
    setShow((prev) => (prev !== shouldShow ? shouldShow : prev));
  });

  return (
    <group ref={groupRef}>
      {MARKERS.map((m, i) => (
        <group key={i} position={m.pos}>
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color={0xffcf5a} transparent />
          </mesh>
          {show && (
            <Html distanceFactor={22} center style={{ pointerEvents: "none" }}>
              <div className="map-pin">
                <span className="map-pin-title">{m.label}</span>
                {m.sub && <span className="map-pin-sub">{m.sub}</span>}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
