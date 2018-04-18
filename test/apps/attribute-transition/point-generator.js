function interpolate(range, r) {
  return range[0] * (1 - r) + range[1] * r;
}

function random(range) {
  return interpolate(range, Math.random());
}

export default class PointGenerator {
  constructor({center, distance, radiusRange, countRange}) {
    this.center = center;
    this.distance = distance;
    this.radiusRange = radiusRange;
    this.countRange = countRange;

    this.points = [];

    this.randomizeCount();
  }

  randomizeCount() {
    const {countRange} = this;
    const count = Math.round(random(countRange));

    // Randomly generate new points
    this.points = new Array(count).fill(0).map(() => ({}));
    this.randomizePositions();
    this.randomizeRadius();
    this.randomizeColors();
  }

  randomizePositions() {
    const {points, center, distance} = this;
    const aspectRatio = distance[0] / distance[1];
    const distanceRange = [0, distance[1]];

    points.forEach(p => {
      const a = Math.PI * 2 * Math.random();
      const d = random(distanceRange);
      p.position = [center[0] + Math.cos(a) * d * aspectRatio, center[1] + Math.sin(a) * d];
    });
  }

  randomizeRadius() {
    const {points, radiusRange} = this;
    points.forEach(p => {
      p.radius = random(radiusRange);
    });
  }

  randomizeColors() {
    const {points} = this;
    const color = [random([0, 128]), random([0, 128]), random([0, 128])];

    points.forEach(p => {
      p.color = color.concat(random([0, 255]));
    });
  }
}
