export type AggregateAccessor<DataT = any> = {
  /** a list of objects whose positions fall inside this cell. */
  objects: DataT[];
  objectInfo: {
    /** the indices of `objects` in the original data. */
    indices: number[];
    /** the value of the `data` prop */
    data: any;
  };
};
