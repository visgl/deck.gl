import {ColumnLayer, GridCellLayer} from '@deck.gl/layers';
import {GL} from '@luma.gl/constants';
import {hexagons, worldGrid} from 'deck.gl-test/data';

const cullBackParameters = {
  cull: true,
  cullFace: GL.BACK
};

export const polygonCCW = [
  [1, 0, 0],
  [0.3, 1, 0],
  [-0.6, 1, 0],
  [-1, -0.3, 0],
  [0, -1, 0]
];

function genColumnLayerTestCase(settings, props = {}, visState = {}) {
  return {
    name: settings.name,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 30,
      bearing: 0,
      orthographic: true,
      ...visState
    },
    layers: [
      new ColumnLayer({
        id: settings.name,
        data: hexagons,
        radius: 250,
        angle: Math.PI / 2,
        coverage: 1,
        getPosition: h => h.centroid,
        getFillColor: h => [48, 128, h.value * 255, 255],
        parameters: cullBackParameters,
        ...props
      })
    ],
    goldenImage: `./test/render/golden-images/${settings.goldenImage || settings.name}.png`
  };
}

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
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-extruded-wireframe'
    },
    {
      wireframe: true,
      extruded: true,
      getElevation: h => h.value * 5000
    }
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-extruded-wireframe-ccw',
      goldenImage: 'column-lnglat-extruded-wireframe-vertices'
    },
    {
      extruded: true,
      wireframe: true,
      diskResolution: polygonCCW.length,
      vertices: polygonCCW,
      getElevation: h => h.value * 5000
    }
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-extruded-wireframe-cw',
      goldenImage: 'column-lnglat-extruded-wireframe-vertices'
    },
    {
      extruded: true,
      wireframe: true,
      diskResolution: polygonCCW.length,
      vertices: polygonCCW.reverse(),
      getElevation: h => h.value * 5000
    }
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-flat-stroke'
    },
    {
      extruded: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 4,
      getLineColor: [255, 255, 255]
    },
    {pitch: 0}
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-flat-stroke-ccw',
      goldenImage: 'column-lnglat-flat-stroke-vertices'
    },
    {
      extruded: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 4,
      getLineColor: [255, 255, 255],
      diskResolution: polygonCCW.length,
      vertices: polygonCCW
    },
    {pitch: 0}
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-flat-stroke-cw',
      goldenImage: 'column-lnglat-flat-stroke-vertices'
    },
    {
      extruded: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 4,
      getLineColor: [255, 255, 255],
      diskResolution: polygonCCW.length,
      vertices: polygonCCW.reverse()
    },
    {pitch: 0}
  ),
  genColumnLayerTestCase(
    {
      name: 'column-lnglat-extruded-wireframe-flatshading',
      goldenImage: 'column-lnglat-extruded-wireframe-flatshading'
    },
    {
      extruded: true,
      wireframe: true,
      flatShading: true,
      diskResolution: polygonCCW.length,
      vertices: polygonCCW,
      getElevation: h => h.value * 5000
    }
  )
];
