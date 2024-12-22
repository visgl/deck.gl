import {
  CompositeLayer,
  AttributeManager,
  UpdateParameters,
  CompositeLayerProps
} from '@deck.gl/core';
export declare type AggregationLayerProps<DataT = any> = CompositeLayerProps<DataT>;
export default abstract class AggregationLayer<
  ExtraPropsT = {}
> extends CompositeLayer<ExtraPropsT> {
  static layerName: string;
  state: CompositeLayer['state'] & {
    ignoreProps?: Record<string, any>;
    dimensions?: any;
  };
  initializeAggregationLayer(dimensions: any): void;
  updateState(opts: UpdateParameters<this>): void;
  updateAttributes(changedAttributes: any): void;
  getAttributes(): {
    [id: string]: import('modules/core/src/lib/attribute/shader-attribute').IShaderAttribute;
  };
  getModuleSettings(): any;
  updateShaders(shaders: any): void;
  /**
   * Checks if aggregation is dirty
   * @param {Object} updateOpts - object {props, oldProps, changeFlags}
   * @param {Object} params - object {dimension, compareAll}
   * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
   * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
   * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
   **/
  isAggregationDirty(
    updateOpts: any,
    params?: {
      compareAll?: boolean;
      dimension?: any;
    }
  ): string | boolean;
  /**
   * Checks if an attribute is changed
   * @param {String} name - name of the attribute
   * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
   *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
   **/
  isAttributeChanged(name?: string): boolean;
  _getAttributeManager(): AttributeManager;
}
// # sourceMappingURL=aggregation-layer.d.ts.map
