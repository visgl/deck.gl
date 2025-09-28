export type Point = [x: number, y: number];
export type Line = Point[];

export function makePointGrid(opts: {
  xRange: [min: number, max: number];
  yRange: [min: number, max: number];
  step: number;
}): Point[] {
  const {xRange, yRange, step} = opts;
  const result: Point[] = [];
  for (let y = yRange[0]; y <= yRange[1]; y += step) {
    for (let x = xRange[0]; x <= xRange[1]; x += step) {
      result.push([x, y]);
    }
  }
  return result;
}

export function makeLineGrid(opts: {
  xRange: [min: number, max: number];
  yRange: [min: number, max: number];
  step: number;
}): Line[] {
  const {xRange, yRange, step} = opts;
  const result: Line[] = [];
  for (let y = yRange[0]; y <= yRange[1]; y += step) {
    result.push([
      [xRange[0], y],
      [xRange[1], y]
    ]);
  }
  for (let x = xRange[0]; x <= xRange[1]; x += step) {
    result.push([
      [x, yRange[0]],
      [x, yRange[1]]
    ]);
  }
  return result;
}
