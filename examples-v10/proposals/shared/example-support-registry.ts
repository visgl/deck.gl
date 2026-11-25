import type {ExampleSupportDefinition} from './example-support';
import support79 from '../arrow-path-layer/mobile-support';
import support80 from '../arrow-polygon-layer/mobile-support';
import support81 from '../arrow-text-layer/mobile-support';
import support82 from '../luspatial-taxi/mobile-support';
import support83 from '../gpu-graph-explorer/mobile-support';
import support84 from '../gpu-culled-trace/mobile-support';

export const EXAMPLE_SUPPORT_REGISTRY: Record<string, ExampleSupportDefinition> = {
  'deck/arrow-path-layer': support79,
  'deck/arrow-polygon-layer': support80,
  'deck/arrow-text-layer': support81,
  'deck/luspatial-taxi': support82,
  'deck/gpu-graph-explorer': support83,
  'deck/gpu-culled-trace': support84
};

export function getExampleSupportDefinition(id: string): ExampleSupportDefinition | undefined {
  return EXAMPLE_SUPPORT_REGISTRY[id];
}
