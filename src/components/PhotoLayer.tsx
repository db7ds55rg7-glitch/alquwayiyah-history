import { useEffect, useRef } from "react";
import { PHOTO_MOMENTS } from "../data/photoMoments";
import { useJourney } from "../store/useJourney";

function smoothstep(x: number, a: number, b: number) {
  if (a === b) return x >= b ? 1 : 0;
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * لقطات توثيقية حقيقية تقتحم المشهد ثلاثي الأبعاد للحظات قصيرة — صور فعلية
 * أرسلها المستخدم، تُعرض بتأثير سينمائي (تكبير بطيء + تلاشٍ) ثم تعود للمشهد.
 */
export function PhotoLayer() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const margin = 0.012;
    const tick = () => {
      const t = useJourney.getState().smoothProgress;
      PHOTO_MOMENTS.forEach((p, i) => {
        const el = refs.current[i];
        const img = imgRefs.current[i];
        if (!el || !img) return;
        const [a, b] = p.range;
        let factor: number;
        if (t < a || t > b) factor = 0;
        else if (t < a + margin) factor = smoothstep(t, a, a + margin);
        else if (t > b - margin) factor = 1 - smoothstep(t, b - margin, b);
        else factor = 1;

        el.style.opacity = String(factor);
        el.style.pointerEvents = "none";
        el.style.visibility = factor < 0.01 ? "hidden" : "visible";

        // تكبير بطيء (Ken Burns) طوال مدة ظهور الصورة
        const localT = Math.min(Math.max((t - a) / (b - a || 1), 0), 1);
        const scale = 1.04 + localT * 0.07;
        img.style.transform = `scale(${scale})`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="photo-layer">
      {PHOTO_MOMENTS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="photo-frame"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <img
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={p.src}
            alt={p.caption}
          />
          <div className="photo-vignette" />
          <span className="photo-caption">{p.caption}</span>
        </div>
      ))}
    </div>
  );
}
