import type Attribute from '../lib/attribute/attribute';
import type {TransitionSettings} from '../lib/attribute/attribute-transition-utils';

export default interface GPUTransition {
  get type(): string;
  get inProgress(): boolean;
  get attributeInTransition(): Attribute;

  start(transitionSettings: TransitionSettings, numInstances: number): void;
  update(): boolean;
  cancel(): void;
}
