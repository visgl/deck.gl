export declare function IJToST(
  ij: [number, number],
  order: number,
  offsets: [number, number]
): [number, number];
export declare function STToUV(st: [number, number]): [number, number];
export declare function FaceUVToXYZ(
  face: number,
  [u, v]: [number, number]
): [number, number, number];
export declare function XYZToLngLat([x, y, z]: [number, number, number]): [number, number];
export declare function toHilbertQuadkey(idS: string): string;
export declare function FromHilbertQuadKey(hilbertQuadkey: string): {
  face: number;
  ij: [number, number];
  level: number;
};
// # sourceMappingURL=s2-geometry.d.ts.map
