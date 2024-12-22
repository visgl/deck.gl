import type {Device} from '@luma.gl/api';
import {Timeline} from '@luma.gl/engine';
import Attribute from '../lib/attribute/attribute';
import {InterpolationTransitionSettings} from '../lib/attribute/attribute-transition-utils';
import type GPUTransition from './gpu-transition';
export default class GPUInterpolationTransition implements GPUTransition {
  device: Device;
  type: string;
  attributeInTransition: Attribute;
  private settings?;
  private attribute;
  private transition;
  private currentStartIndices;
  private currentLength;
  private transform;
  private buffers;
  constructor({
    device,
    attribute,
    timeline
  }: {
    device: Device;
    attribute: Attribute;
    timeline: Timeline;
  });
  get inProgress(): boolean;
  start(transitionSettings: InterpolationTransitionSettings, numInstances: number): void;
  update(): boolean;
  cancel(): void;
}
// # sourceMappingURL=gpu-interpolation-transition.d.ts.map
