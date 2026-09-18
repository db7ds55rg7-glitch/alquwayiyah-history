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

interface HouseDef {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rot: number;
  tone: number;
}

function generateHouses(
  seed: number,
  centerX: number,
  centerZ: number,
  radius: number,
  count: number,
  rowSpacing: number,
  avoid: [number, number][] = [],
  avoidRadius = 5
): HouseDef[] {
  const rand = mulberry32(seed);
  const houses: HouseDef[] = [];
  const cols = Math.ceil(Math.sqrt(count * 1.4));
  for (let i = 0; i < count; i++) {
    const gx = (i % cols) - cols / 2;
    const gz = Math.floor(i / cols) - cols / 2;
    const jitterX = (rand() - 0.5) * rowSpacing * 0.5;
    const jitterZ = (rand() - 0.5) * rowSpacing * 0.5;
    const x = centerX + gx * rowSpacing + jitterX;
    const z = centerZ + gz * rowSpacing + jitterZ;
    const dist = Math.hypot(x - centerX, z - centerZ);
    if (dist > radius) continue;
    // تجنّب وضع بيت مباشرة على مسار الكاميرا حتى لا يخترقه العدسة
    if (avoid.some(([ax, az]) => Math.hypot(x - ax, z - az) < avoidRadius)) continue;
    houses.push({
      x,
      z,
      w: 2.2 + rand() * 2.4,
      d: 2.2 + rand() * 2.4,
      h: 1.8 + rand() * 2.2,
      rot: rand() * Math.PI * 2,
      tone: Math.floor(rand() * 3),
    });
  }
  return houses;
}

// درجات طين مشمّسة متفاوتة قليلًا لكسر رتابة الصندوق الواحد
const CLAY_TONES = [0xd6a76a, 0xc99457, 0xbd8850];
const roofColor = new THREE.Color(0xa07d4c);
const doorColor = new THREE.Color(0x2e2014);

/** كتلة بيوت طينية إجرائية — تُستخدم لغصيبة والعقدة والحلة بأنماط مختلفة */
export function ClayHouses({
  seed,
  centerX,
  centerZ,
  radius,
  count,
  spacing,
  towerCorners = false,
  wall = false,
  avoid = [],
}: {
  seed: number;
  centerX: number;
  centerZ: number;
  radius: number;
  count: number;
  spacing: number;
  towerCorners?: boolean;
  wall?: boolean;
  avoid?: [number, number][];
}) {
  const houses = useMemo(
    () => generateHouses(seed, centerX, centerZ, radius, count, spacing, avoid),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, centerX, centerZ, radius, count, spacing]
  );

  const bodyMaterials = useMemo(
    () => CLAY_TONES.map((hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, flatShading: true })),
    []
  );
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.9, flatShading: true }), []);
  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.8 }), []);
  const towerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xa88250, roughness: 0.9, flatShading: true }),
    []
  );

  const wallPoints = useMemo(() => {
    if (!wall) return [];
    const pts: [number, number, number][] = [];
    const seg = 40;
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const rx = radius * 1.05;
      const x = centerX + Math.cos(a) * rx;
      const z = centerZ + Math.sin(a) * rx * 0.85;
      pts.push([x, getTerrainHeight(x, z) + 1.1, z]);
    }
    return pts;
  }, [wall, centerX, centerZ, radius]);

  return (
    <group>
      {houses.map((h, i) => {
        const groundY = getTerrainHeight(h.x, h.z);
        const showDoor = h.h > 2.0;
        return (
          <group key={i} position={[h.x, groundY, h.z]} rotation={[0, h.rot, 0]}>
            <mesh position={[0, h.h / 2, 0]} material={bodyMaterials[h.tone]} castShadow receiveShadow>
              <boxGeometry args={[h.w, h.h, h.d]} />
            </mesh>
            <mesh position={[0, h.h + 0.13, 0]} material={roofMat} castShadow receiveShadow>
              <boxGeometry args={[h.w + 0.3, 0.26, h.d + 0.3]} />
            </mesh>
            {showDoor && (
              <mesh position={[0, 0.6, h.d / 2 + 0.03]} material={doorMat}>
                <boxGeometry args={[Math.min(0.55, h.w * 0.32), 1.15, 0.1]} />
              </mesh>
            )}
          </group>
        );
      })}
      {wallPoints.map((p, i) => (
        <mesh key={`wall-${i}`} position={p} material={towerMat} castShadow>
          <boxGeometry args={[1.4, 2.2, 1.4]} />
        </mesh>
      ))}
      {towerCorners &&
        [0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const x = centerX + Math.cos(a) * radius * 1.1;
          const z = centerZ + Math.sin(a) * radius * 0.95;
          const y = getTerrainHeight(x, z);
          return (
            <mesh key={`tw-${i}`} position={[x, y + 2.2, z]} material={towerMat} castShadow>
              <cylinderGeometry args={[1.1, 1.4, 4.4, 10]} />
            </mesh>
          );
        })}
    </group>
  );
}
