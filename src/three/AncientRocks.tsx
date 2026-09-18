import { useMemo } from "react";
import * as THREE from "three";
import { getTerrainHeight } from "./buildJourneyTerrain";
import { getNoiseTexture } from "./proceduralTexture";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// مشهد صخري تصويري بسيط لمرحلة "الإنسان القديم" — بلا نقوش أو رسوم مختلقة،
// اكتفاءً بكتل صخرية طبيعية ملساء توحي بالقدم دون ادّعاء توثيق أثري محدد.
export function AncientRocks() {
  const boulders = useMemo(() => {
    const rand = mulberry32(555);
    const out = [];
    for (let i = 0; i < 18; i++) {
      const x = -80 + rand() * 40;
      const z = -205 - rand() * 55;
      out.push({
        x,
        z,
        y: getTerrainHeight(x, z),
        s: 1.4 + rand() * 3.2,
        rot: rand() * Math.PI,
        key: i,
      });
    }
    return out;
  }, []);

  const rockMat = useMemo(() => {
    const noise = getNoiseTexture();
    return new THREE.MeshStandardMaterial({
      color: 0x7a6448,
      roughness: 1,
      roughnessMap: noise,
      bumpMap: noise,
      bumpScale: 0.2,
      flatShading: true,
    });
  }, []);

  return (
    <group>
      {boulders.map((b) => (
        <mesh
          key={b.key}
          position={[b.x, b.y + b.s * 0.4, b.z]}
          rotation={[0.2, b.rot, 0.1]}
          material={rockMat}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[b.s, 1]} />
        </mesh>
      ))}
    </group>
  );
}
