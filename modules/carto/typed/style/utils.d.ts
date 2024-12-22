import {Feature} from 'geojson';
export declare type AttributeSelector<DataT = Feature, OutT = any> = string | ((d: DataT) => OutT);
export declare function getAttrValue<DataT = Feature, OutT = any>(
  attr: string | AttributeSelector<DataT, OutT>,
  d: DataT
): OutT;
export declare function assert(condition: any, message?: string): asserts condition;
// # sourceMappingURL=utils.d.ts.map
