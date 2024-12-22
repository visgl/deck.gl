export declare type ZRange = [minZ: number, maxZ: number];
export declare type Bounds = [minX: number, minY: number, maxX: number, maxY: number];
export declare type GeoBoundingBox = {
  west: number;
  north: number;
  east: number;
  south: number;
};
export declare type NonGeoBoundingBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export declare type TileBoundingBox = NonGeoBoundingBox | GeoBoundingBox;
export declare type TileIndex = {
  x: number;
  y: number;
  z: number;
};
export declare type TileLoadProps = {
  index: TileIndex;
  id: string;
  bbox: TileBoundingBox;
  url?: string | null;
  signal?: AbortSignal;
  userData?: Record<string, any>;
  zoom?: number;
};
// # sourceMappingURL=types.d.ts.map
