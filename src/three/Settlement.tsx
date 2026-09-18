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
    });
  }
  return houses;
}

const clayColor = new THREE.Color(0x8a6338);
const clayColorDark = new THREE.Color(0x6b4a28);

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

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: clayColor, roughness: 1, flatShading: true }),
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
        return (
          <mesh
            key={i}
            geometry={boxGeo}
            material={material}
            position={[h.x, groundY + h.h / 2, h.z]}
            rotation={[0, h.rot, 0]}
            scale={[h.w, h.h, h.d]}
            castShadow
            receiveShadow
          />
        );
      })}
      {wallPoints.map((p, i) => (
        <mesh key={`wall-${i}`} position={p} castShadow>
          <boxGeometry args={[1.4, 2.2, 1.4]} />
          <meshStandardMaterial color={clayColorDark} roughness={1} flatShading />
        </mesh>
      ))}
      {towerCorners &&
        [0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const x = centerX + Math.cos(a) * radius * 1.1;
          const z = centerZ + Math.sin(a) * radius * 0.95;
          const y = getTerrainHeight(x, z);
          return (
            <mesh key={`tw-${i}`} position={[x, y + 2.2, z]} castShadow>
              <cylinderGeometry args={[1.1, 1.4, 4.4, 10]} />
              <meshStandardMaterial color={clayColorDark} roughness={1} flatShading />
            </mesh>
          );
        })}
    </group>
  );
}
