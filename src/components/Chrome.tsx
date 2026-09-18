import { useEffect, useRef, useState } from "react";
import { useJourney } from "../store/useJourney";
import { startAmbient, stopAmbient } from "../audio/AmbientEngine";
import { useAmbientDriver } from "../hooks/useAmbientDriver";
import { CHAPTERS } from "../data/content";

export function Chrome() {
  const audioOn = useJourney((s) => s.audioOn);
  const toggleAudio = useJourney((s) => s.toggleAudio);
  const barRef = useRef<HTMLDivElement>(null);
  const [chapterLabel, setChapterLabel] = useState("");

  useAmbientDriver();

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = useJourney.getState().smoothProgress;
      if (barRef.current) barRef.current.style.width = `${t * 100}%`;
      const current = CHAPTERS.find((c) => t >= c.range[0] && t <= c.range[1]);
      setChapterLabel((prev) => {
        const next = current?.title || current?.era || "";
        return next !== prev ? next : prev;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleToggle = () => {
    if (!audioOn) startAmbient();
    else stopAmbient();
    toggleAudio();
  };

  return (
    <div className="chrome">
      <div className="chrome-progress-track">
        <div ref={barRef} className="chrome-progress-bar" />
      </div>
      <div className="chrome-row">
        <span className="chrome-chapter">{chapterLabel}</span>
        <button type="button" className="chrome-audio-btn" onClick={handleToggle} aria-pressed={audioOn}>
          {audioOn ? "إيقاف الصوت" : "تشغيل الصوت"}
        </button>
      </div>
    </div>
  );
}
