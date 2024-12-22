export default class CPUAggregator {
  state: {
    layerData: {
      data: any;
    };
    dimensions: {};
  };
  changeFlags: {};
  dimensionUpdaters: {};
  _getCellSize: any;
  _getAggregator: any;
  constructor(opts: any);
  static defaultDimensions(): (
    | {
        key: string;
        accessor: string;
        pickingInfo: string;
        getBins: {
          triggers: {
            value: {
              prop: string;
              updateTrigger: string;
            };
            weight: {
              prop: string;
              updateTrigger: string;
            };
            aggregation: {
              prop: string;
            };
            filterData: {
              prop: string;
              updateTrigger: string;
            };
          };
        };
        getDomain: {
          triggers: {
            lowerPercentile: {
              prop: string;
            };
            upperPercentile: {
              prop: string;
            };
            scaleType: {
              prop: string;
            };
          };
        };
        getScaleFunc: {
          triggers: {
            domain: {
              prop: string;
            };
            range: {
              prop: string;
            };
          };
          onSet: {
            props: string;
          };
        };
        nullValue: number[];
      }
    | {
        key: string;
        accessor: string;
        pickingInfo: string;
        getBins: {
          triggers: {
            value: {
              prop: string;
              updateTrigger: string;
            };
            weight: {
              prop: string;
              updateTrigger: string;
            };
            aggregation: {
              prop: string;
            };
            filterData: {
              prop: string;
              updateTrigger: string;
            };
          };
        };
        getDomain: {
          triggers: {
            lowerPercentile: {
              prop: string;
            };
            upperPercentile: {
              prop: string;
            };
            scaleType: {
              prop: string;
            };
          };
        };
        getScaleFunc: {
          triggers: {
            domain: {
              prop: string;
            };
            range: {
              prop: string;
            };
          };
          onSet: {
            props: string;
          };
        };
        nullValue: number;
      }
  )[];
  updateState(
    opts: any,
    aggregationParams: any
  ): {
    layerData: {
      data: any;
    };
    dimensions: {};
  };
  setState(updateObject: any): void;
  setDimensionState(key: any, updateObject: any): void;
  normalizeResult(result?: {hexagons?: any; layerData?: any}):
    | {
        hexagons?: any;
        layerData?: any;
      }
    | {
        hexagons?: any;
        layerData?: any;
        data: any;
      };
  getAggregatedData(props: any, aggregationParams: any): void;
  updateGetValueFuncs(oldProps: any, props: any, changeFlags: any): void;
  needsReProjectPoints(oldProps: any, props: any, changeFlags: any): any;
  addDimension(dimensions: any): void;
  _addDimension(dimensions?: any[]): void;
  getDimensionUpdaters({
    key,
    accessor,
    pickingInfo,
    getBins,
    getDomain,
    getScaleFunc,
    nullValue
  }: {
    key: any;
    accessor: any;
    pickingInfo: any;
    getBins: any;
    getDomain: any;
    getScaleFunc: any;
    nullValue: any;
  }): {
    key: any;
    accessor: any;
    pickingInfo: any;
    getBins: any;
    getDomain: any;
    getScaleFunc: any;
    attributeAccessor: (cell: any) => any;
  };
  needUpdateDimensionStep(dimensionStep: any, oldProps: any, props: any, changeFlags: any): boolean;
  getDimensionChanges(oldProps: any, props: any, changeFlags: any): any[];
  getUpdateTriggers(props: any): {};
  getSortedBins(props: any): void;
  getDimensionSortedBins(props: any, dimensionUpdater: any): void;
  getDimensionValueDomain(props: any, dimensionUpdater: any): void;
  getDimensionScale(props: any, dimensionUpdater: any): void;
  getSubLayerDimensionAttribute(key: any, nullValue: any): (cell: any) => any;
  getSubLayerAccessors(props: any): {};
  getPickingInfo({info}: {info: any}): any;
  getAccessor(dimensionKey: any): any;
}
// # sourceMappingURL=cpu-aggregator.d.ts.map
