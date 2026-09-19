import raqibahTower from "../assets/photos/raqibah-tower.jpg";
import quwayiyahAerial from "../assets/photos/quwayiyah-aerial.jpg";
import quwayiyahPark from "../assets/photos/quwayiyah-park.jpg";
import wadiMountains from "../assets/photos/wadi-mountains.jpg";
import wadiFlowers from "../assets/photos/wadi-flowers.jpg";

export interface PhotoMoment {
  id: string;
  src: string;
  /** بداية ونهاية ظهور الصورة كنسبة من رحلة السكرول */
  range: [number, number];
  caption: string;
}

// لقطات توثيقية حقيقية تقتحم الإعادة الرقمية للحظات — صور فعلية أرسلها المستخدم،
// لا تصوير ذكاء اصطناعي ولا نموذج ثلاثي الأبعاد.
export const PHOTO_MOMENTS: PhotoMoment[] = [
  {
    id: "tower-photo",
    src: raqibahTower,
    range: [0.503, 0.534],
    caption: "صورة حقيقية لبرج حجري تاريخي بالمنطقة",
  },
  {
    id: "wadi-photo-1",
    src: wadiMountains,
    range: [0.575, 0.601],
    caption: "جبال ووادي القويعية بعد المطر",
  },
  {
    id: "wadi-photo-2",
    src: wadiFlowers,
    range: [0.604, 0.618],
    caption: "الغطاء النباتي الموسمي في جبال المنطقة",
  },
  {
    id: "present-photo-1",
    src: quwayiyahAerial,
    range: [0.9, 0.929],
    caption: "القويعية اليوم من الجو",
  },
  {
    id: "present-photo-2",
    src: quwayiyahPark,
    range: [0.94, 0.966],
    caption: "أحد متنزهات القويعية اليوم",
  },
];
