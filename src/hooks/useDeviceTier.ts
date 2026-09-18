import { useEffect } from "react";
import { useJourney } from "../store/useJourney";

export function useDeviceTier() {
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.innerWidth < 820;
    const lowCores = (nav.hardwareConcurrency ?? 8) <= 4;
    const lowMem = (nav.deviceMemory ?? 8) <= 4;

    let quality: "high" | "medium" | "low" = "high";
    if ((isCoarse && isNarrow) || lowMem) quality = lowCores ? "low" : "medium";
    else if (isCoarse || isNarrow) quality = "medium";

    useJourney.getState().setQuality(quality);
  }, []);
}
