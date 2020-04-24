import {request, json} from 'd3-request';
import {voronoi} from 'd3-voronoi';
import DelaunayInterpolation from '../layers/delaunay-interpolation/delaunay-interpolation';

const STATIONS_DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/wind/stations.json'; // eslint-disable-line
const WEATHER_DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/wind/weather.bin'; // eslint-disable-line

export function loadData() {
  return Promise.all([loadStations(), loadWeatherData()]).then(([stations, weather]) => {
    const bbox = getBBox(stations);
    const triangulation = triangulate(stations);
    const delaunayInterpolation = new DelaunayInterpolation({
      bbox,
      triangulation,
      measures: weather,
      textureWidth: 1024
    });
    const texData = delaunayInterpolation.generateTextures();

    return {
      stations,
      weather,
      bbox,
      triangulation,
      texData
    };
  });
}

function loadStations() {
  return new Promise((resolve, reject) => {
    json(STATIONS_DATA_URL)
      .on('load', stations => {
        /**
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
        **/
        resolve(stations);
      })
      .on('error', reject)
      .get();
  });
}

function loadWeatherData() {
  return new Promise((resolve, reject) => {
    request(WEATHER_DATA_URL)
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
  for (let j = i * components; count < l; j += hours * components) {
    count++;
    array.push(new Float32Array([bufferData[j + 0], bufferData[j + 1], bufferData[j + 2]]));
  }

  return array;
}
