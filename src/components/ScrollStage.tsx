import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TOTAL_VH } from "../data/content";
import { useJourney } from "../store/useJourney";

gsap.registerPlugin(ScrollTrigger);

export function ScrollStage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => {
        useJourney.getState().setProgress(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return <div ref={ref} className="scroll-stage" style={{ height: `${TOTAL_VH}vh` }} aria-hidden="true" />;
}
