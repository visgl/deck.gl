import { LineLayer } from '@deck.gl/layers';
import ArcGISMap from "esri/Map";
import MapView from "esri/views/MapView";
import { EsriDeckLayer } from '@deck.gl/arcgis';

const syntheticData = [];

for (let r = 1; r <= 20; r++) {
  const seed = Math.random();

  const N = 500;
  let x0;
  let y0;
  let z0;
  let x1;
  let y1;
  let z1;
  const h = 0.01;
  const a = 10.0;
  const b = 28.0;
  const c = 8.0 / 3.0;
  x0 = Math.random() * 3;
  y0 = Math.random() * 10;
  z0 = Math.random() * 10;
  for (let i = 0; i < N; i++) {
      x1 = x0 + h * a * (y0 - x0);
      y1 = y0 + h * (x0 * (b - z0) - y0);
      z1 = z0 + h * (x0 * y0 - c * z0);
      syntheticData.push({
        start: [x0 * 0.2 + 2, y0 * 0.2 + 54, z0],
        end: [x1 * 0.2 + 2, y1 * 0.2 + 54, z1],
        name: "Segment-" + r + "-" + (i + 1),
        seed
      });
      x0 = x1;
      y0 = y1;
      z0 = z1;
  }
}

const layer = new EsriDeckLayer({
  getDeckLayer() {
    const t = performance.now() / 1000;

    return new LineLayer({
      id: "flight-paths",
      data: syntheticData.slice(),
      opacity: 0.8,
      getSourcePosition: (d) => d.start,
      getTargetPosition: (d) => d.end,
      getColor (d) {
        const z = d.start[2];
        const r = z / 100 + d.seed * 0.2 + 0.4 * Math.sin(t) + 0.3;
        return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r * r)];
      },
      getWidth: 4
    })
  }
});

setInterval(() => {
  layer.redraw();
}, 50);

// In the ArcGIS API for JavaScript the MapView is responsible
// for displaying a Map, which usually contains at least a basemap.
const view = new MapView({
  container: "app",
  map: new ArcGISMap({
    basemap: "dark-gray-vector",
    layers: [layer]
  }),
  center: [0.119167, 52.205276],
  zoom: 7
});