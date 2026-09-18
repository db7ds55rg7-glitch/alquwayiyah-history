import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTerrainHeight } from "./buildJourneyTerrain";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Wadi() {
  const rocks = useMemo(() => {
    const rand = mulberry32(202);
    const out = [];
    for (let i = 0; i < 60; i++) {
      const z = -85 - rand() * 130;
      const x = -55 + Math.sin(z * 0.04) * 20 + (rand() - 0.5) * 26;
      out.push({
        x,
        z,
        y: getTerrainHeight(x, z),
        s: 0.8 + rand() * 2.6,
        rot: rand() * Math.PI,
        key: i,
      });
    }
    return out;
  }, []);

  const shaftsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!shaftsRef.current) return;
    shaftsRef.current.children.forEach((c, i) => {
      const m = c as THREE.Mesh;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.abs(Math.sin(state.clock.elapsedTime * 0.3 + i)) * 0.05;
    });
  });

  const shafts = [
    { x: -25, z: -140 },
    { x: -50, z: -170 },
    { x: -15, z: -100 },
  ];

  return (
    <group>
      {rocks.map((r) => (
        <mesh key={r.key} position={[r.x, r.y + r.s * 0.5, r.z]} rotation={[0.3, r.rot, 0.15]} castShadow receiveShadow>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={0x92795a} roughness={1} flatShading />
        </mesh>
      ))}
      <group ref={shaftsRef}>
        {shafts.map((s, i) => (
          <mesh key={i} position={[s.x, getTerrainHeight(s.x, s.z) + 20, s.z]} rotation={[0, 0, 0]}>
            <coneGeometry args={[10, 45, 24, 1, true]} />
            <meshBasicMaterial color={0xffdca0} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
