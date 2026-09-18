import { useEffect, useRef } from "react";
import { CHAPTERS } from "../data/content";
import { useJourney } from "../store/useJourney";

function smoothstep(x: number, a: number, b: number) {
  if (a === b) return x >= b ? 1 : 0;
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

export function CaptionLayer() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = useJourney.getState().smoothProgress;
      CHAPTERS.forEach((ch, i) => {
        const el = refs.current[i];
        if (!el) return;
        const [a, b] = ch.range;
        // هامش التلاشي محصور داخل مدى الفصل نفسه حتى لا يتداخل مع الفصل المجاور
        const margin = Math.min(0.02, (b - a) / 2);
        let factor: number;
        if (t < a || t > b) factor = 0;
        else if (t < a + margin) factor = smoothstep(t, a, a + margin);
        else if (t > b - margin) factor = 1 - smoothstep(t, b - margin, b);
        else factor = 1;
        el.style.opacity = String(factor);
        el.style.transform = `translateY(${(1 - factor) * 18}px)`;
        el.style.visibility = factor < 0.01 ? "hidden" : "visible";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="caption-layer" aria-live="polite">
      {CHAPTERS.map((ch, i) => (
        <div
          key={ch.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="caption-block"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {ch.era && <span className="caption-era">{ch.era}</span>}
          {ch.title && <h2 className="caption-title">{ch.title}</h2>}
          {ch.lines.map((l, li) => (
            <p key={li} className="caption-line">
              {l}
            </p>
          ))}
          {ch.note && <span className="caption-note">{ch.note}</span>}
        </div>
      ))}
    </div>
  );
}
