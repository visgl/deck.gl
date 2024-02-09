import {H3HexagonLayer, H3ClusterLayer} from '@deck.gl/geo-layers';

import {getRes0Cells, gridDisk} from 'h3-js';

export default [
  {
    name: 'h3-hexagon-layer',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 11,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: gridDisk('882830829bfffff', 4),
        opacity: 0.8,
        getHexagon: d => d,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getElevation: (d, {index}) => index * 100
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon.png'
  },
  {
    name: 'h3-hexagon-layer-high-precision',
    viewState: {
      latitude: 50.103,
      longitude: -143.478,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: gridDisk('891c0000003ffff', 4),
        opacity: 0.8,
        getHexagon: d => d,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getElevation: (d, {index}) => index * 10
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-high-precision.png'
  },
  {
    name: 'h3-hexagon-layer-flat',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: gridDisk('882830829bfffff', 4),
        opacity: 0.8,
        getHexagon: d => d,
        extruded: false,
        stroked: true,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-flat.png'
  },
  {
    name: 'h3-hexagon-layer-flat-high-precision',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: gridDisk('882830829bfffff', 4),
        opacity: 0.8,
        getHexagon: d => d,
        extruded: false,
        stroked: true,
        highPrecision: true,
        getFillColor: (d, {index}) => [255, index * 5, 0],
        getLineColor: [255, 255, 255],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-flat.png'
  },
  {
    name: 'h3-hexagon-layer-low-zoom',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3HexagonLayer({
        data: getRes0Cells(),
        opacity: 0.8,
        getHexagon: d => d,
        extruded: false,
        filled: false,
        stroked: true,
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/h3-hexagon-low-zoom.png'
  },
  {
    name: 'h3-cluster-layer',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 11,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3ClusterLayer({
        data: ['882830829bfffff'],
        opacity: 0.8,
        getHexagons: d => gridDisk(d, 6),
        getLineWidth: 100,
        stroked: true,
        filled: false
      })
    ],
    goldenImage: './test/render/golden-images/h3-cluster.png'
  },
  {
    name: 'h3-cluster-layer-crossing-antimeridian',
    viewState: {
      latitude: 40,
      longitude: -180,
      zoom: 5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new H3ClusterLayer({
        data: ['8432b61ffffffff'],
        opacity: 0.8,
        getHexagons: d => gridDisk(d, 5),
        getLineWidth: 10_000,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 5,
        stroked: true,
        filled: false
      })
    ],
    goldenImage: './test/render/golden-images/h3-cluster-crossing-antimeridan.png'
  }
];
