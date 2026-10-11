import type {ExampleSupportDefinition} from './example-support';
import flowParticlesSupport from './deck/flow-particles/mobile-support';
import sketchSupport from './deck/sketch-edges/mobile-support';
import globeCloudsSupport from './deck/globe-clouds/mobile-support';
import weatherSupport from './deck/weather/mobile-support';
import patternSupport from './deck/pattern-fills/mobile-support';
import firefliesSupport from './deck/fireflies/mobile-support';
import hdrNightLightingSupport from './deck/hdr-night-lighting/mobile-support';
import globalIlluminationSupport from './deck/global-illumination/mobile-support';
import lightShaftsSupport from './deck/light-shafts/mobile-support';
import pointGlowSupport from './deck/point-glow/mobile-support';
import styledPathsSupport from './deck/styled-paths/mobile-support';
import sceneBuffersSupport from './deck/scene-buffers/mobile-support';
import ambientOcclusionSupport from './deck/ambient-occlusion/mobile-support';
import softShadowsSupport from './deck/soft-shadows/mobile-support';
import depthOfFieldSupport from './deck/depth-of-field/mobile-support';
import citySceneSupport from './deck/city-scene/mobile-support';
import support79 from './deck/arrow-path-layer/mobile-support';
import support80 from './deck/arrow-polygon-layer/mobile-support';
import support81 from './deck/arrow-text-layer/mobile-support';
import support82 from './deck/luspatial-taxi/mobile-support';
import support83 from './deck/gpu-graph-explorer/mobile-support';
import support84 from './deck/gpu-culled-trace/mobile-support';

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
