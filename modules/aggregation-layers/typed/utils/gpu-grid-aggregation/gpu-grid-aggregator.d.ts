import type {Device} from '@luma.gl/api';
export declare type GPUGridAggregatorProps = {
  id?: string;
};
export default class GPUGridAggregator {
  static getAggregationData({
    aggregationData,
    maxData,
    minData,
    maxMinData,
    pixelIndex
  }: {
    aggregationData: any;
    maxData: any;
    minData: any;
    maxMinData: any;
    pixelIndex: any;
  }): {
    cellCount?: any;
    cellWeight?: any;
    maxCellWieght?: any;
    minCellWeight?: any;
    totalCount?: any;
  };
  static getCellData({countsData, size}: {countsData: any; size?: number}): {
    cellCounts: Uint32Array;
    cellWeights: Float32Array;
  };
  static isSupported(device: Device): boolean;
  state: {
    weightAttributes: {};
    textures: {};
    meanTextures: {};
    buffers: {};
    framebuffers: {};
    maxMinFramebuffers: {};
    minFramebuffers: {};
    maxFramebuffers: {};
    equations: {};
    shaderOptions: {};
    modelDirty: boolean;
    resources: {};
    results: {};
  };
  id: string;
  device: Device;
  _hasGPUSupport: boolean;
  gridAggregationModel: any;
  allAggregationModel: any;
  meanTransform: any;
  constructor(device: Device, props?: GPUGridAggregatorProps);
  delete(): void;
  run(opts?: {}): {};
  getData(weightId: any): {
    aggregationData?: any;
  };
  updateShaders(shaderOptions?: {}): void;
  _normalizeAggregationParams(opts: any): any;
  setState(updateObject: any): void;
  _getAggregateData(opts: any): {};
  _renderAggregateData(opts: any): void;
  _renderToMaxMinTexture(opts: any): void;
  _renderToWeightsTexture(opts: any): void;
  _runAggregation(opts: any): {};
  _setupFramebuffers(opts: any): void;
  _getMinMaxTexture(name: any): any;
  _setupModels({numCol, numRow}?: {numCol?: number; numRow?: number}): void;
  _setupWeightAttributes(opts: any): void;
  _trackGPUResultBuffers(results: any, weights: any): void;
  _updateModels(opts: any): void;
}
// # sourceMappingURL=gpu-grid-aggregator.d.ts.map
