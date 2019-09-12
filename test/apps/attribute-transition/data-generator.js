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
    maxDistance = 250,
    radiusRange = [25, 75],
    countRange = [1, 5],
    vertexRange = [3, 5],
    sizeRange = [3, 8]
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
    this.polygons = Array.from({length: count}, () => {
      const vertexCount = randomInt(this.vertexRange);
      const a = random(0, Math.PI * 2);
      const d = Math.sqrt(random(0, 1)) * this.maxDistance;
      const center = [d * Math.cos(a), d * Math.sin(a)];
      const r = random(this.radiusRange);
      const color = [random(0, 255), random(0, 255), random(0, 255)];
      const size = random(this.sizeRange);

      const vertices = Array.from({length: vertexCount + 1}, (v, i) => {
        const ai = ((Math.PI * 2) / vertexCount) * i;
        const p = [center[0] + Math.cos(ai) * r, center[1] + Math.sin(ai) * r];
        this.points.push({color, position: p, radius: size * 2});
        return p;
      });

      return {color, polygon: vertices, width: size};
    });
  }
}
