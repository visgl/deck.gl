import type {Device} from '@luma.gl/api';
import type Attribute from './attribute';
import type {Timeline} from '@luma.gl/engine';
export default class AttributeTransitionManager {
  id: string;
  isSupported: boolean;
  private device;
  private timeline?;
  private transitions;
  private needsRedraw;
  private numInstances;
  constructor(
    device: Device,
    {
      id,
      timeline
    }: {
      id: string;
      timeline?: Timeline;
    }
  );
  finalize(): void;
  update({
    attributes,
    transitions,
    numInstances
  }: {
    attributes: {
      [id: string]: Attribute;
    };
    transitions: any;
    numInstances: number;
  }): void;
  hasAttribute(attributeName: string): boolean;
  getAttributes(): {
    [id: string]: Attribute;
  };
  run(): boolean;
  private _removeTransition;
  private _updateAttribute;
}
// # sourceMappingURL=attribute-transition-manager.d.ts.map
