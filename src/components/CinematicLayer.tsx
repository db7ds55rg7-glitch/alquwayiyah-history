import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Experience } from "../three/Experience";
import { CaptionLayer } from "./CaptionLayer";
import { Chrome } from "./Chrome";
import { useJourney } from "../store/useJourney";

export function CinematicLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const quality = useJourney((s) => s.quality);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = useJourney.getState().progress;
      const el = wrapRef.current;
      if (el) {
        const fadeStart = 0.975;
        const opacity = t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / (1 - fadeStart));
        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity < 0.02 ? "none" : "auto";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dpr: [number, number] = quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.5] : [1, 1];

  return (
    <div ref={wrapRef} className="cinematic-layer">
      <Canvas
        shadows={quality !== "low" ? { type: THREE.PCFShadowMap } : false}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 45, near: 0.1, far: 900 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <Experience />
      </Canvas>
      <CaptionLayer />
      <Chrome />
    </div>
  );
}
