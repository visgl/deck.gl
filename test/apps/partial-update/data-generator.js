import {lerp} from 'math.gl';

function random(min, max) {
  if (Array.isArray(min)) {
    max = min[1];
    min = min[0];
  }
  return lerp(min, max, Math.random());
}

function randomInt(min, max) {
  return Math.round(random(min, max));
}

export default class DataGenerator {
  constructor({
    maxDistance = 20000,
    radiusRange = [1000, 3000],
    countRange = [10, 10],
    vertexRange = [3, 12],
    sizeRange = [100, 200]
  } = {}) {
    this.maxDistance = maxDistance;
    this.radiusRange = radiusRange;
    this.countRange = countRange;
    this.vertexRange = vertexRange;
    this.sizeRange = sizeRange;

    this.randomize();
  }

  randomize() {
    const count = randomInt(this.countRange);
    this.points = [];

    // Randomly generate new points
    this.polygons = Array.from({length: count}, (_, i) => {
      const vertexCount = randomInt(this.vertexRange);
      const a = random(0, Math.PI * 2);
      const d = random(0, this.maxDistance);
      const center = [d * Math.cos(a), d * Math.sin(a)];
      const r = random(this.radiusRange);
      const color = [random(0, 255), random(0, 255), random(0, 255)];
      const size = random(this.sizeRange);

      const vertices = Array.from({length: vertexCount}, (v, j) => {
        const ai = ((Math.PI * 2) / vertexCount) * j;
        const p = [center[0] + Math.cos(ai) * r, center[1] + Math.sin(ai) * r];
        this.points.push({color, position: p, radius: size * 2, polygonIndex: i});
        return p;
      });

      return {color, polygon: vertices, width: size};
    });
  }
}
