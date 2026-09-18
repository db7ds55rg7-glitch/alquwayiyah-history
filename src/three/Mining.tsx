import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTerrainHeight } from "./buildJourneyTerrain";

// جدار طبقات جيولوجي رأسي — يقع غربي مسار الكاميرا بمسافة أمان كافية حتى تطير
// الكاميرا بمحاذاته وتراه كواجهة (وليس أفقيًا من فوقه، فتختفي الطبقات حافةً).
const WALL_X = -88;
const WALL_Z = -280;
const WALL_LEN = 100; // امتداد الجدار على المحور Z

const STRATA_COLORS = [0x4a3d2e, 0x5c4a34, 0x6e5a3c, 0x816844, 0x93794e];

export function Mining() {
  const baseY = getTerrainHeight(WALL_X, WALL_Z);

  const veinsRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!veinsRef.current) return;
    const pulse = 0.65 + Math.sin(state.clock.elapsedTime * 1.4) * 0.3;
    veinsRef.current.children.forEach((c) => {
      const m = c as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = pulse;
    });
  });

  const veins = useMemo(() => {
    const out: THREE.TubeGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const y0 = baseY + 4 - i * 9;
      const x0 = WALL_X + 2.2;
      const pts = [
        new THREE.Vector3(x0, y0, WALL_Z - WALL_LEN / 2 + 8),
        new THREE.Vector3(x0 + 1.5, y0 + 3, WALL_Z - 15 + i * 3),
        new THREE.Vector3(x0 - 1, y0 - 2, WALL_Z + 12),
        new THREE.Vector3(x0 + 1, y0 + 2, WALL_Z + WALL_LEN / 2 - 6),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      out.push(new THREE.TubeGeometry(curve, 40, 0.4, 8, false));
    }
    return out;
  }, [baseY]);

  const strataBands = useMemo(() => {
    const out = [];
    for (let i = 0; i < STRATA_COLORS.length; i++) {
      out.push({
        y: baseY + 8 - i * 9,
        color: STRATA_COLORS[i],
        h: 8.6,
      });
    }
    return out;
  }, [baseY]);

  return (
    <group>
      {/* واجهة الجدار الصخري بطبقاته */}
      {strataBands.map((s, i) => (
        <mesh key={i} position={[WALL_X, s.y, WALL_Z]} receiveShadow castShadow>
          <boxGeometry args={[4, s.h, WALL_LEN]} />
          <meshStandardMaterial color={s.color} roughness={1} flatShading />
        </mesh>
      ))}
      <group ref={veinsRef}>
        {veins.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial
              color={0xffcf5a}
              emissive={0xffb92a}
              emissiveIntensity={0.7}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>
        ))}
      </group>
      {/* نفق تعديني يغور داخل الجدار */}
      <mesh position={[WALL_X - 3, baseY - 12, WALL_Z - 10]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[3.2, 3.2, 14, 16, 1, true]} />
        <meshStandardMaterial color={0x120d09} roughness={1} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[WALL_X - 8, baseY - 12, WALL_Z - 10]} color={0xffcf7a} intensity={18} distance={26} />
      <pointLight position={[WALL_X + 3, baseY, WALL_Z]} color={0xffb35a} intensity={10} distance={40} />
    </group>
  );
}
