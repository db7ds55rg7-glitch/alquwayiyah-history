import { Suspense } from "react";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Terrain } from "./Terrain";
import { DustParticles } from "./DustParticles";
import { StarsSky } from "./StarsSky";
import { MapMarkers } from "./MapMarkers";
import { SceneGroup } from "./SceneGroup";
import { ClayHouses } from "./Settlement";
import { RaqibahTower } from "./RaqibahTower";
import { Wadi } from "./Wadi";
import { AncientRocks } from "./AncientRocks";
import { Mining } from "./Mining";
import { Timeline3D } from "./Timeline3D";
import { PresentCity } from "./PresentCity";
import { useJourney } from "../store/useJourney";
import { CAMERA_KEYS, type SceneKey } from "../data/cameraPath";

function pathPointsFor(scene: SceneKey): [number, number][] {
  return CAMERA_KEYS.filter((k) => k.scene === scene).map((k) => [k.pos[0], k.pos[2]]);
}

const GHASAYBAH_PATH = pathPointsFor("ghasaybah");
const UQDAH_PATH = pathPointsFor("uqdah");
const HILLAH_PATH = pathPointsFor("hillah");

export function Experience() {
  const quality = useJourney((s) => s.quality);
  const highEnd = quality === "high";

  return (
    <>
      <CameraRig />
      <Lighting />
      <StarsSky />

      <Suspense fallback={null}>
        <Terrain />
      </Suspense>

      <DustParticles count={quality === "low" ? 700 : quality === "medium" ? 1300 : 2200} />

      <MapMarkers />

      <SceneGroup scene="ghasaybah">
        <ClayHouses
          seed={11}
          centerX={-6}
          centerZ={-14}
          radius={26}
          count={70}
          spacing={5}
          avoid={GHASAYBAH_PATH}
        />
      </SceneGroup>

      <SceneGroup scene="uqdah">
        <ClayHouses
          seed={22}
          centerX={-30}
          centerZ={-10}
          radius={24}
          count={60}
          spacing={5.5}
          wall
          towerCorners
          avoid={UQDAH_PATH}
        />
      </SceneGroup>

      <SceneGroup scene="hillah">
        <ClayHouses
          seed={33}
          centerX={30}
          centerZ={-32}
          radius={18}
          count={40}
          spacing={4.8}
          avoid={HILLAH_PATH}
        />
      </SceneGroup>

      <SceneGroup scene="tower">
        <RaqibahTower />
      </SceneGroup>

      <SceneGroup scene="wadi">
        <Wadi />
      </SceneGroup>

      <SceneGroup scene="ancient">
        <AncientRocks />
      </SceneGroup>

      <SceneGroup scene="mining">
        <Mining />
      </SceneGroup>

      <Timeline3D />

      <SceneGroup scene="present">
        <PresentCity />
      </SceneGroup>

      {highEnd && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.65} luminanceSmoothing={0.3} intensity={0.4} mipmapBlur />
          <DepthOfField focusDistance={0.02} focalLength={0.045} bokehScale={1.6} />
          <Vignette eskil={false} offset={0.35} darkness={0.45} />
        </EffectComposer>
      )}
      {!highEnd && quality === "medium" && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.7} intensity={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.35} darkness={0.4} />
        </EffectComposer>
      )}
    </>
  );
}
