import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useJourney } from "../store/useJourney";

const TIPS = [
  "جاري استحضار الذاكرة…",
  "نرسم ملامح الوادي…",
  "نعيد بناء البيوت الطينية…",
  "نوقظ حكاية القويعية…",
];

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [display, setDisplay] = useState(0);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);
  const [tip, setTip] = useState(TIPS[0]);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    const MIN_MS = 2200;
    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const timeBased = Math.min(100, (elapsed / MIN_MS) * 100);
      const next = Math.min(100, Math.max(progress, timeBased * 0.6));
      setDisplay((prev) => (next > prev ? next : prev));
      const finished = !active && elapsed > MIN_MS;
      if (finished) {
        setDisplay(100);
        setFading(true);
        document.body.style.overflow = "";
        useJourney.getState().setReady(true);
        setTimeout(() => setDone(true), 600);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    document.body.style.overflow = "hidden";
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, progress]);

  if (done) return null;

  return (
    <div className={`loading-screen${fading ? " fading" : ""}`}>
      <div className="loading-inner">
        <div className="loading-title">القويعية</div>
        <div className="loading-tip">{tip}</div>
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: `${display}%` }} />
        </div>
        <div className="loading-pct">{Math.floor(display)}٪</div>
      </div>
    </div>
  );
}
