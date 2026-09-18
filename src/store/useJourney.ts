import { create } from "zustand";

export type Quality = "high" | "medium" | "low";

interface JourneyState {
  progress: number; // 0..1 عبر كامل الرحلة، يُحدَّث من ScrollTrigger
  smoothProgress: number; // نسخة مخمَّدة تُستخدم داخل مشهد الـ3D
  ready: boolean; // انتهى التحميل
  audioOn: boolean;
  quality: Quality;
  setProgress: (p: number) => void;
  setSmoothProgress: (p: number) => void;
  setReady: (v: boolean) => void;
  toggleAudio: () => void;
  setQuality: (q: Quality) => void;
}

export const useJourney = create<JourneyState>((set) => ({
  progress: 0,
  smoothProgress: 0,
  ready: false,
  audioOn: false,
  quality: "high",
  setProgress: (p) => set({ progress: p }),
  setSmoothProgress: (p) => set({ smoothProgress: p }),
  setReady: (v) => set({ ready: v }),
  toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
  setQuality: (q) => set({ quality: q }),
}));
