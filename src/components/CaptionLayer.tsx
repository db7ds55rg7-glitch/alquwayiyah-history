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
    // نصف عرض التلاشي عند كل حد مشترك بين فصلين متجاورين — تلاشٍ متبادل متماثل
    // حول نقطة الحد نفسها، بدل أن يبدأ كل فصل تلاشيه من الصفر داخل مداه فقط
    // (وهو ما كان يترك الفصل الافتتاحي عند بداية الصفحة بلا نص أبدًا لأن t=0
    // تساوي بداية مداه بالضبط).
    const HALF_MARGIN = 0.01;
    const tick = () => {
      const t = useJourney.getState().smoothProgress;
      CHAPTERS.forEach((ch, i) => {
        const el = refs.current[i];
        if (!el) return;
        const [a, b] = ch.range;
        const hasPrev = i > 0;
        const hasNext = i < CHAPTERS.length - 1;
        let factor: number;
        if (t < a || t > b) factor = 0;
        else if (hasPrev && t < a + HALF_MARGIN) factor = smoothstep(t, a - HALF_MARGIN, a + HALF_MARGIN);
        else if (hasNext && t > b - HALF_MARGIN) factor = 1 - smoothstep(t, b - HALF_MARGIN, b + HALF_MARGIN);
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
