import {ColumnLayer, GridCellLayer} from '@deck.gl/layers';
import {hexagons, worldGrid} from 'deck.gl-test/data';

export default [
  {
    name: 'gridcell-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GridCellLayer({
        id: 'gridcell-lnglat',
        data: worldGrid.data,
        cellSize: worldGrid.cellSize,
        extruded: true,
        getFillColor: g => [245, 166, g.value * 255, 255],
        getElevation: h => h.value * 5000
      })
    ],
    goldenImage: './test/render/golden-images/gridcell-lnglat.png'
  },
  {
    name: 'column-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 30,
      bearing: 0,
      orthographic: true
    },
    layers: [
      new ColumnLayer({
        id: 'column-lnglat',
        data: hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        extruded: true,
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        getElevation: h => h.value * 5000
      })
    ],
    goldenImage: './test/render/golden-images/column-lnglat.png'
  },
  {
    name: 'column-lnglat-stroke',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0,
      orthographic: true
    },
    layers: [
      new ColumnLayer({
        id: 'column-lnglat',
        data: hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        extruded: false,
        stroked: true,
        lineWidthUnits: 'pixels',
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        getLineColor: [255, 255, 255],
        getLineWidth: 4
      })
    ],
    goldenImage: './test/render/golden-images/column-lnglat-stroke.png'
  }
];
