import type {ExampleSupportDefinition} from './example-support';
import flowParticlesSupport from '../flow-particles/mobile-support';
import sketchSupport from '../sketch-edges/mobile-support';
import globeCloudsSupport from '../globe-clouds/mobile-support';
import weatherSupport from '../weather/mobile-support';
import patternSupport from '../pattern-fills/mobile-support';
import firefliesSupport from '../fireflies/mobile-support';
import hdrNightLightingSupport from '../hdr-night-lighting/mobile-support';
import globalIlluminationSupport from '../global-illumination/mobile-support';
import lightShaftsSupport from '../light-shafts/mobile-support';
import pointGlowSupport from '../point-glow/mobile-support';
import styledPathsSupport from '../styled-paths/mobile-support';
import sceneBuffersSupport from '../scene-buffers/mobile-support';
import ambientOcclusionSupport from '../ambient-occlusion/mobile-support';
import softShadowsSupport from '../soft-shadows/mobile-support';
import depthOfFieldSupport from '../depth-of-field/mobile-support';
import citySceneSupport from '../city-scene/mobile-support';
import support79 from '../arrow-path-layer/mobile-support';
import support80 from '../arrow-polygon-layer/mobile-support';
import support81 from '../arrow-text-layer/mobile-support';
import support82 from '../luspatial-taxi/mobile-support';
import support83 from '../gpu-graph-explorer/mobile-support';
import support84 from '../gpu-culled-trace/mobile-support';

export const EXAMPLE_SUPPORT_REGISTRY: Record<string, ExampleSupportDefinition> = {
  'deck/fireflies': firefliesSupport,
  'deck/hdr-night-lighting': hdrNightLightingSupport,
  'deck/global-illumination': globalIlluminationSupport,
  'deck/light-shafts': lightShaftsSupport,
  'deck/scene-buffers': sceneBuffersSupport,
  'deck/ambient-occlusion': ambientOcclusionSupport,
  'deck/soft-shadows': softShadowsSupport,
  'deck/depth-of-field': depthOfFieldSupport,
  'deck/flow-particles': flowParticlesSupport,
  'deck/arrow-path-layer': support79,
  'deck/city-scene': citySceneSupport,
  'deck/arrow-polygon-layer': support80,
  'deck/arrow-text-layer': support81,
  'deck/luspatial-taxi': support82,
  'deck/gpu-graph-explorer': support83,
  'deck/gpu-culled-trace': support84,
  'deck/sketch-edges': sketchSupport,
  'deck/weather': weatherSupport,
  'deck/globe-clouds': globeCloudsSupport,
  'deck/pattern-fills': patternSupport,
  'deck/point-glow': pointGlowSupport,
  'deck/styled-paths': styledPathsSupport
};

export function getExampleSupportDefinition(id: string): ExampleSupportDefinition | undefined {
  return EXAMPLE_SUPPORT_REGISTRY[id];
}
