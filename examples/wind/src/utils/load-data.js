import {request, json} from 'd3-request';
import {voronoi} from 'd3-voronoi';
import DelaunayInterpolation from '../layers/delaunay-interpolation/delaunay-interpolation';
import {MARGIN, SAMPLE} from '../defaults';

export function loadData() {
  return Promise.all([
    loadStations(),
    loadWeatherData()
  ])
  .then(([stations, weather]) => {
    const boundingBox = getBBox(stations);
    const triangulation = triangulate(stations);
    const delaunayInterpolation = new DelaunayInterpolation({
      boundingBox,
      triangulation,
      measures: weather,
      textureWidth: 1024
    });
    const texData = delaunayInterpolation.generateTextures();

    return {
      stations,
      weather,
      boundingBox,
      triangulation,
      texData
    };
  });
}

function loadStations() {
  return new Promise((resolve, reject) => {
    json('data/stations.json')
      .on('load', (stations) => {
        // add four dummy stations at the end
        const boundingBox = getBBox(stations);
        const boundingBoxMargin = {
          minLat: boundingBox.minLat - MARGIN,
          maxLat: boundingBox.maxLat + MARGIN,
          minLng: boundingBox.minLng - MARGIN,
          maxLng: boundingBox.maxLng + MARGIN
        };
        const centroid = {
          long: (boundingBoxMargin.maxLng + boundingBoxMargin.minLng) / 2,
          lat: (boundingBoxMargin.maxLat + boundingBoxMargin.minLat) / 2
        };
        const a = (boundingBoxMargin.maxLng - boundingBoxMargin.minLng) / 2;
        const b = (boundingBoxMargin.maxLat - boundingBoxMargin.minLat) / 2;
        const dummy = Array.from(Array(SAMPLE)).map((_, i) => {
          const angle = Math.PI * 2 / SAMPLE * i;
          const long = -(Math.cos(angle) * a + centroid.long);
          const lat = Math.sin(angle) * b + centroid.lat;
          return {long, lat, elv: 10};
        });
        resolve(stations.concat(dummy));
      })
      .on('error', reject)
      .get();
  });
}

function loadWeatherData() {
  return new Promise((resolve, reject) => {
    request('data/weather.bin')
      .responseType('arraybuffer')
      .on('load', req => {
        resolve(parseData(req.response));
      })
      .on('error', reject)
      .get();
  });
}

function getBBox(data) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  data.forEach(d => {
    minLat = d.lat < minLat ? d.lat : minLat;
    minLng = -d.long < minLng ? -d.long : minLng;
    maxLat = d.lat > maxLat ? d.lat : maxLat;
    maxLng = -d.long > maxLng ? -d.long : maxLng;
  });

  return {minLat, minLng, maxLat, maxLng};
}

function triangulate(data) {
  data.forEach((d, i) => {
    d.index = i;
  });
  return voronoi(data)
    .x(d => -d.long)
    .y(d => d.lat)
    .triangles(data);
}

function parseData(buffer) {
  const bufferData = new Uint16Array(buffer);
  const hours = 72;
  const components = 3;
  const l = bufferData.length / (hours * components);
  const hourlyData = Array(hours);

  for (let i = 0; i < hours; ++i) {
    hourlyData[i] = createHourlyData(bufferData, i, l, hours, components);
  }

  return hourlyData;
}

function createHourlyData(bufferData, i, l, hours, components) {
  const array = []; // add four dummy stations

  let count = 0;
  for (let j = i * components; count < l; j += (hours * components)) {
    count++;
    array.push(new Float32Array([
      bufferData[j + 0],
      bufferData[j + 1],
      bufferData[j + 2]
    ]));
  }
  // four dummy stations all point towards the centroid of the states
  // array.push(new Float32Array([ 1,0,0]),
  //            new Float32Array([ 7,0,0]),
  //            new Float32Array([ 3,0,0]),
  //            new Float32Array([ 5,0,0]));

  // four dummy stations all point against the centroid of the states
  // array.push(new Float32Array([ 5,10,10]),
  //            new Float32Array([ 3,10,10]),
  //            new Float32Array([ 7,10,10]),
  //            new Float32Array([ 1,10,10]));

  Array.from(Array(SAMPLE)).forEach((_, i) => { // eslint-disable-line
    const angle = Math.round(((Math.PI * 2 / SAMPLE * i) % (Math.PI * 2)) / (Math.PI / 4));
    array.push(new Float32Array([angle, 0, 0]));
  });

  return array;
}
