import { ScrollStage } from "./components/ScrollStage";
import { CinematicLayer } from "./components/CinematicLayer";
import { LoadingScreen } from "./components/LoadingScreen";
import { SourcesSection } from "./components/SourcesSection";
import { useDeviceTier } from "./hooks/useDeviceTier";

function App() {
  useDeviceTier();

  return (
    <div className="app-root">
      <LoadingScreen />
      <CinematicLayer />
      <ScrollStage />
      <SourcesSection />
    </div>
  );
}

export default App;
