export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type Axis = 'x' | 'y' | 'z';

export type Tick = {
  value: string,
  position: number,
  text: string,
};

export type TickFormat<DataT = unknown> = (t: DataT, axis: Axis) => string;

/**
 * Unresolved complaint from type checker. Used while migrating code to
 * TypeScript, and should be fixed when possible.
 */
export type $TODO = any;
