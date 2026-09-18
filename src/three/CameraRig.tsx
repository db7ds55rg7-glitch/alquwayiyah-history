import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { sampleCamera, samplePalette } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

export function CameraRig() {
  const { camera, scene } = useThree();
  const smoothed = useRef(0);

  useFrame((_, delta) => {
    const target = useJourney.getState().progress;
    // تخميد خفيف لحركة الكاميرا حتى لا تكون مرتبطة حرفيًا بكل حدث تمرير صغير
    smoothed.current = THREE.MathUtils.damp(smoothed.current, target, 6, delta);
    useJourney.getState().setSmoothProgress(smoothed.current);

    const t = smoothed.current;
    const cam = sampleCamera(t);
    camera.position.copy(cam.position);
    camera.lookAt(cam.look);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }

    const palette = samplePalette(t);
    if (!scene.fog) {
      scene.fog = new THREE.Fog(palette.fogColor.getHex(), palette.fogNear, palette.fogFar);
    } else if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(palette.fogColor);
      scene.fog.near = palette.fogNear;
      scene.fog.far = palette.fogFar;
    }
    scene.background = palette.fogColor;
  });

  return null;
}
