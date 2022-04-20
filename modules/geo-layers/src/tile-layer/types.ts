export type ZRange = [minZ: number, maxZ: number];

export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type GeoBoundingBox = {west: number; north: number; east: number; south: number};

export type TileBoundingBox =
  | {left: number; top: number; right: number; bottom: number}
  | GeoBoundingBox;

export type TileIndex = {x: number; y: number; z: number};

export type TileLoadProps = {
  index: TileIndex;
  id: string;
  bbox: TileBoundingBox;
  url?: string | null;
  signal?: AbortSignal;
};
