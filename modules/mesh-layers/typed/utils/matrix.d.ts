export declare const MATRIX_ATTRIBUTES: {
  size: number;
  accessor: string[];
  shaderAttributes: {
    readonly instanceModelMatrix__LOCATION_0: {
      readonly size: 3;
      readonly elementOffset: 0;
    };
    readonly instanceModelMatrix__LOCATION_1: {
      readonly size: 3;
      readonly elementOffset: 3;
    };
    readonly instanceModelMatrix__LOCATION_2: {
      readonly size: 3;
      readonly elementOffset: 6;
    };
    readonly instanceTranslation: {
      readonly size: 3;
      readonly elementOffset: 9;
    };
  };
  update(
    attribute: any,
    {
      startRow,
      endRow
    }: {
      startRow: any;
      endRow: any;
    }
  ): void;
};
export declare function shouldComposeModelMatrix(viewport: any, coordinateSystem: any): boolean;
// # sourceMappingURL=matrix.d.ts.map
