import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { samplePalette } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

let cachedTexture: THREE.Texture | null = null;
function getDustTexture() {
  if (cachedTexture) return cachedTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  cachedTexture = new THREE.CanvasTexture(canvas);
  return cachedTexture;
}

const BOX = new THREE.Vector3(70, 46, 70);

export function DustParticles({ count = 2200 }: { count?: number }) {
  const quality = useJourney((s) => s.quality);
  const n = quality === "high" ? count : quality === "medium" ? Math.round(count * 0.55) : Math.round(count * 0.25);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * BOX.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * BOX.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * BOX.z;
      seeds[i] = Math.random() * 1000;
    }
    return { positions, seeds };
  }, [n]);

  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { camera } = useThree();
  const texture = getDustTexture();

  useFrame((state) => {
    const points = pointsRef.current;
    const mat = matRef.current;
    if (!points || !mat) return;
    const t = useJourney.getState().smoothProgress;
    const palette = samplePalette(t);
    mat.color.copy(palette.particleColor);
    mat.opacity = THREE.MathUtils.clamp(palette.particleDensity, 0, 1) * 0.55;

    points.position.copy(camera.position);

    const arr = points.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const seed = seeds[i];
      arr[i * 3] += Math.sin(time * 0.15 + seed) * 0.01;
      arr[i * 3 + 1] += 0.006 + Math.cos(time * 0.1 + seed) * 0.004;
      arr[i * 3 + 2] += Math.cos(time * 0.12 + seed) * 0.012 + 0.01;

      // التفاف حول الكاميرا حتى يبدو الغبار محيطًا بلا نهاية
      if (arr[i * 3] > BOX.x / 2) arr[i * 3] -= BOX.x;
      if (arr[i * 3] < -BOX.x / 2) arr[i * 3] += BOX.x;
      if (arr[i * 3 + 1] > BOX.y / 2) arr[i * 3 + 1] -= BOX.y;
      if (arr[i * 3 + 1] < -BOX.y / 2) arr[i * 3 + 1] += BOX.y;
      if (arr[i * 3 + 2] > BOX.z / 2) arr[i * 3 + 2] -= BOX.z;
      if (arr[i * 3 + 2] < -BOX.z / 2) arr[i * 3 + 2] += BOX.z;
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={texture}
        size={0.55}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </points>
  );
}
