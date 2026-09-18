// مسار الكاميرا السينمائي الكامل للرحلة — كل نقطة تمثل لحظة (t من 0 إلى 1)
// تُبنى منها منحنيات Catmull-Rom سلسة لموضع الكاميرا ونقطة تركيزها (lookAt).
// "scene" تحدد أي مجموعة عناصر 3D ظاهرة عند هذه اللحظة (تُستخدم للمزج/التلاشي بين المشاهد).

export type SceneKey =
  | "opening"
  | "map"
  | "transition"
  | "ghasaybah"
  | "uqdah"
  | "hillah"
  | "tower"
  | "wadi"
  | "ancient"
  | "mining"
  | "timeline"
  | "present";

export interface CamKey {
  t: number;
  scene: SceneKey;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

export const CAMERA_KEYS: CamKey[] = [
  // === الافتتاحية: ارتفاع شاهق فوق الظلام، ثم نزول بطيء ===
  { t: 0.0, scene: "opening", pos: [0, 140, 10], look: [0, 0, -60], fov: 45 },
  { t: 0.02, scene: "opening", pos: [0, 95, 40], look: [0, 5, -40], fov: 42 },
  { t: 0.045, scene: "opening", pos: [0, 55, 70], look: [0, 8, -10], fov: 40 },

  // === الخريطة ثلاثية الأبعاد: السعودية -> الرياض -> القويعية ===
  { t: 0.06, scene: "map", pos: [10, 150, 130], look: [0, 0, 0], fov: 50 },
  { t: 0.09, scene: "map", pos: [-30, 90, 90], look: [10, 0, 0], fov: 46 },
  { t: 0.13, scene: "map", pos: [-10, 40, 60], look: [0, 0, 0], fov: 42 },
  { t: 0.17, scene: "map", pos: [0, 18, 35], look: [0, 4, 0], fov: 40 },

  // === انتقال إلى الماضي: تراجع وغبار وتحول لوني ===
  { t: 0.21, scene: "transition", pos: [0, 30, 55], look: [0, 5, 0], fov: 42 },

  // === غصيبة: نزول بين البيوت ===
  { t: 0.23, scene: "ghasaybah", pos: [40, 26, 40], look: [0, 4, 0], fov: 42 },
  { t: 0.26, scene: "ghasaybah", pos: [14, 7, 16], look: [-4, 4, -6], fov: 46 },
  { t: 0.29, scene: "ghasaybah", pos: [-6, 5, -4], look: [-14, 4, -14], fov: 48 },

  // === العقدة: البلدة المسوَّرة ===
  { t: 0.31, scene: "uqdah", pos: [-30, 20, 10], look: [-10, 4, -6], fov: 42 },
  { t: 0.34, scene: "uqdah", pos: [-16, 6, -2], look: [-30, 4, -10], fov: 46 },
  { t: 0.37, scene: "uqdah", pos: [-34, 5, -20], look: [-46, 4, -22], fov: 46 },

  // === الحلة ===
  { t: 0.39, scene: "hillah", pos: [10, 18, -10], look: [24, 4, -18], fov: 42 },
  { t: 0.42, scene: "hillah", pos: [22, 6, -22], look: [34, 4, -30], fov: 44 },
  { t: 0.44, scene: "hillah", pos: [30, 9, -32], look: [40, 5, -40], fov: 42 },

  // === برج الرقيبة: اقتراب ثم دوران ثم صعود ===
  { t: 0.46, scene: "tower", pos: [55, 20, 10], look: [30, 18, -30], fov: 40 },
  { t: 0.49, scene: "tower", pos: [58, 22, -35], look: [40, 20, -34], fov: 38 },
  { t: 0.51, scene: "tower", pos: [18, 24, -62], look: [40, 20, -34], fov: 38 },
  { t: 0.535, scene: "tower", pos: [40, 46, -34], look: [40, 20, -34.1], fov: 42 },

  // === الوادي ===
  { t: 0.56, scene: "wadi", pos: [10, 14, -80], look: [-10, 4, -120], fov: 44 },
  { t: 0.59, scene: "wadi", pos: [-20, 6, -130], look: [-40, 5, -170], fov: 48 },
  { t: 0.62, scene: "wadi", pos: [-45, 8, -175], look: [-60, 6, -210], fov: 46 },

  // === الإنسان القديم: صخور وطبقات ===
  { t: 0.64, scene: "ancient", pos: [-55, 10, -210], look: [-70, 4, -230], fov: 40 },
  { t: 0.68, scene: "ancient", pos: [-60, 5, -235], look: [-75, 2, -250], fov: 38 },

  // === التعدين: هبوط تحت الأرض ثم تحليق بمحاذاة جدار الطبقات وعروق الذهب ===
  { t: 0.7, scene: "mining", pos: [-58, -2, -248], look: [-88, -6, -255], fov: 42 },
  { t: 0.74, scene: "mining", pos: [-60, -16, -268], look: [-88, -18, -272], fov: 44 },
  { t: 0.77, scene: "mining", pos: [-58, -26, -290], look: [-88, -28, -288], fov: 44 },
  { t: 0.8, scene: "mining", pos: [-55, -14, -312], look: [-86, -16, -308], fov: 42 },

  // === خط الزمن التفاعلي: صعود وتحليق فوق المحطات ===
  { t: 0.82, scene: "timeline", pos: [-10, 60, -260], look: [-10, 10, -260], fov: 50 },
  { t: 0.85, scene: "timeline", pos: [10, 70, -150], look: [10, 10, -150], fov: 52 },
  { t: 0.88, scene: "timeline", pos: [20, 65, -20], look: [20, 10, -20], fov: 50 },

  // === القويعية اليوم: صعود وعودة للحاضر ===
  { t: 0.91, scene: "present", pos: [30, 50, 60], look: [10, 5, 10], fov: 46 },
  { t: 0.95, scene: "present", pos: [55, 85, 130], look: [10, 0, 20], fov: 48 },
  { t: 1.0, scene: "present", pos: [70, 120, 190], look: [10, -2, 20], fov: 50 },
];

export const SCENE_ORDER: SceneKey[] = [
  "opening",
  "map",
  "transition",
  "ghasaybah",
  "uqdah",
  "hillah",
  "tower",
  "wadi",
  "ancient",
  "mining",
  "timeline",
  "present",
];
