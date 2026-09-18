import * as THREE from "three";

let cached: THREE.Texture | null = null;

/**
 * نسيج ضجيج إجرائي مشترك (bump/roughness) — يكسر مظهر "البلاستيك المصمت"
 * على الأسطح المسطحة (البيوت، الصخور، البرج) دون الحاجة لأي صورة خارجية.
 */
export function getNoiseTexture(): THREE.Texture {
  if (cached) return cached;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  // ضجيج أبيض متعدد الترددات (fBM تقريبي) عبر تراكب طبقتين بحجم خلية مختلف
  const cellA = 3;
  const cellB = 9;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const a = pseudoRandom(Math.floor(x / cellA), Math.floor(y / cellA));
      const b = pseudoRandom(Math.floor(x / cellB) + 500, Math.floor(y / cellB) + 500);
      const v = Math.floor((a * 0.6 + b * 0.4) * 255);
      image.data[idx] = v;
      image.data[idx + 1] = v;
      image.data[idx + 2] = v;
      image.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  cached = tex;
  return tex;
}

function pseudoRandom(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
