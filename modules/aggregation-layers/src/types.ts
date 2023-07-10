/** Type assigned to e.g. getColorValue/getElevationValue props in aggregation layers (e.g. CPUGridLayer, HexagonLayer)*/
export type AggregateAccessor<DataT = any> = (args: {
  /** a list of objects whose positions fall inside this cell. */
  objects: DataT[];
  objectInfo: {
    /** the indices of `objects` in the original data. */
    indices: number[];
    /** the value of the `data` prop */
    data: any;
  };
}) => number;
