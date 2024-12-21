import type {Device} from '@luma.gl/api';
import {SpringTransitionSettings} from '../lib/attribute/attribute-transition-utils';
import Attribute from '../lib/attribute/attribute';
import type {Timeline} from '@luma.gl/engine';
import type GPUTransition from './gpu-transition';
export default class GPUSpringTransition implements GPUTransition {
  device: Device;
  type: string;
  attributeInTransition: Attribute;
  private settings?;
  private attribute;
  private transition;
  private currentStartIndices;
  private currentLength;
  private texture;
  private framebuffer;
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
  start(transitionSettings: SpringTransitionSettings, numInstances: number): void;
  update(): boolean;
  cancel(): void;
}
// # sourceMappingURL=gpu-spring-transition.d.ts.map
