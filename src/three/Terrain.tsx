import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { buildJourneyTerrain } from "./buildJourneyTerrain";
import { samplePalette } from "../hooks/useCameraPath";
import { useJourney } from "../store/useJourney";

const vertexShader = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vColor = color;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform float uAmbient;
  uniform float uDesaturation;
  uniform float uExposure;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;

  void main() {
    vec3 N = normalize(vNormal);
    float diff = max(dot(N, normalize(uSunDir)), 0.0);
    vec3 lit = vColor * (uAmbient + diff * uSunIntensity) * uSunColor;
    float lum = dot(lit, vec3(0.299, 0.587, 0.114));
    vec3 graded = mix(lit, vec3(lum), uDesaturation * 0.55);
    graded *= uExposure;
    float dist = distance(vWorldPos, cameraPosition);
    float fogF = smoothstep(uFogNear, uFogFar, dist);
    vec3 finalColor = mix(graded, uFogColor, fogF);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function Terrain() {
  const quality = useJourney((s) => s.quality);

  const { geometry } = useMemo(() => {
    const segX = quality === "high" ? 220 : quality === "medium" ? 150 : 90;
    const segZ = quality === "high" ? 260 : quality === "medium" ? 175 : 105;
    return buildJourneyTerrain({ width: 440, depth: 520, segX, segZ, offsetZ: -125 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
        uSunColor: { value: new THREE.Color(0xffffff) },
        uSunIntensity: { value: 1 },
        uAmbient: { value: 0.2 },
        uDesaturation: { value: 0 },
        uExposure: { value: 1 },
        uFogColor: { value: new THREE.Color(0x000000) },
        uFogNear: { value: 20 },
        uFogFar: { value: 200 },
      },
    });
  }, []);

  const matRef = useRef(material);
  matRef.current = material;

  useFrame(() => {
    const t = useJourney.getState().smoothProgress;
    const p = samplePalette(t);
    const u = matRef.current.uniforms;
    u.uSunColor.value.copy(p.sunColor);
    u.uSunIntensity.value = p.sunIntensity;
    u.uAmbient.value = p.ambient;
    u.uDesaturation.value = p.desaturation;
    u.uExposure.value = p.exposure;
    u.uFogColor.value.copy(p.fogColor);
    u.uFogNear.value = p.fogNear;
    u.uFogFar.value = p.fogFar;
  });

  return <mesh geometry={geometry} material={material} receiveShadow />;
}
