import { useEffect } from "react";
import { samplePalette } from "./useCameraPath";
import { useJourney } from "../store/useJourney";
import { updateAmbient } from "../audio/AmbientEngine";

export function useAmbientDriver() {
  const audioOn = useJourney((s) => s.audioOn);

  useEffect(() => {
    if (!audioOn) return;
    let raf = 0;
    const tick = () => {
      const t = useJourney.getState().smoothProgress;
      const p = samplePalette(t);
      updateAmbient({
        windIntensity: p.particleDensity,
        droneIntensity: p.desaturation,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioOn]);
}
