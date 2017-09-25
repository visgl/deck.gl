
function interpolate(range, r) {
  return range[0] * (1 - r) + range[1] * r;
}

export default class PointGenerator {

  constructor({center, distanceRange, radiusRange, count}) {
    this.center = center;
    this.distanceRange = distanceRange;
    this.radiusRange = radiusRange;

    this.points = new Array(count).fill(0).map(() => ({}));

    this.randomizePositions();
    this.randomizeRadius();
    this.randomizeColors();
  }

  randomizePositions() {
    const {points, center, distanceRange} = this;
    points.forEach(p => {
      const a = Math.PI * 2 * Math.random();
      const d = interpolate(distanceRange, Math.random());
      p.position = [
        center[0] + Math.cos(a) * d,
        center[1] + Math.sin(a) * d
      ];
    });
  }

  randomizeRadius() {
    const {points, radiusRange} = this;
    points.forEach(p => {
      p.radius = interpolate(radiusRange, Math.random());
    });
  }

  randomizeColors() {
    const {points} = this;
    const color = [
      interpolate([0, 255], Math.random()),
      interpolate([0, 255], Math.random()),
      interpolate([0, 255], Math.random())
    ];

    points.forEach(p => {
      p.color = color.concat(
        interpolate([0, 255], Math.random())
      );
    });
  }
}
