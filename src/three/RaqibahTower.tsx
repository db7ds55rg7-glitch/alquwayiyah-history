import { useMemo } from "react";
import * as THREE from "three";
import { getTerrainHeight } from "./buildJourneyTerrain";

const TOWER_X = 40;
const TOWER_Z = -34;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function RaqibahTower() {
  const groundY = getTerrainHeight(TOWER_X, TOWER_Z);

  const rocks = useMemo(() => {
    const rand = mulberry32(77);
    return new Array(26).fill(0).map((_, i) => {
      const a = rand() * Math.PI * 2;
      const r = 3 + rand() * 9;
      const x = TOWER_X + Math.cos(a) * r;
      const z = TOWER_Z + Math.sin(a) * r * 0.9;
      return {
        x,
        z,
        y: getTerrainHeight(x, z),
        s: 0.6 + rand() * 1.4,
        rot: rand() * Math.PI,
        key: i,
      };
    });
  }, []);

  return (
    <group>
      {/* قاعدة صخرية */}
      <mesh position={[TOWER_X, groundY + 1.2, TOWER_Z]} castShadow receiveShadow>
        <coneGeometry args={[6, 3.2, 8]} />
        <meshStandardMaterial color={0x8a7255} roughness={1} flatShading />
      </mesh>
      {/* برج الرقيبة: أسطواني حجري */}
      <mesh position={[TOWER_X, groundY + 2.6 + 4, TOWER_Z]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 2, 8, 16]} />
        <meshStandardMaterial color={0xc7a878} roughness={0.9} />
      </mesh>
      {/* شرفة أعلى البرج */}
      <mesh position={[TOWER_X, groundY + 2.6 + 8.6, TOWER_Z]} castShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.6, 16]} />
        <meshStandardMaterial color={0xa4865e} roughness={0.85} />
      </mesh>
      {rocks.map((r) => (
        <mesh key={r.key} position={[r.x, r.y + r.s * 0.4, r.z]} rotation={[0, r.rot, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={0x8c7458} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export const RAQIBAH_POSITION = new THREE.Vector3(TOWER_X, 0, TOWER_Z);
