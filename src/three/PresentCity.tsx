import { useMemo } from "react";
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

const buildingMat = new THREE.MeshStandardMaterial({ color: 0xcfc3a6, roughness: 0.8 });

export function PresentCity() {
  const buildings = useMemo(() => {
    const rand = mulberry32(909);
    const out = [];
    const cols = 9;
    for (let i = 0; i < cols * cols; i++) {
      const gx = (i % cols) - cols / 2;
      const gz = Math.floor(i / cols) - cols / 2;
      if (rand() > 0.72) continue;
      const x = 20 + gx * 9 + (rand() - 0.5) * 3;
      const z = 55 + gz * 9 + (rand() - 0.5) * 3;
      out.push({
        x,
        z,
        y: getTerrainHeight(x, z),
        h: 2 + rand() * 9,
        w: 3 + rand() * 2,
        key: i,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {buildings.map((b) => (
        <mesh key={b.key} position={[b.x, b.y + b.h / 2, b.z]} material={buildingMat} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.w]} />
        </mesh>
      ))}
    </group>
  );
}
