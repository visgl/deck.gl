import {
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  // PointCloudLayer,
  BitmapLayer,
  IconLayer,
  ColumnLayer,
  GeoJsonLayer,
  PolygonLayer,
  PathLayer,
  TextLayer
} from '@deck.gl/layers';

import {PathStyleExtension, FillStyleExtension} from '@deck.gl/extensions';

// Demonstrate immutable support
import * as dataSamples from '../data-samples';
import {parseColor, setOpacity} from '../utils/color';
import flattenVertices from '../utils/flatten-vertices';

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

const ArcLayerExample = {
  layer: ArcLayer,
  getData: () => dataSamples.routes,
  propTypes: {
    getHeight: {
      type: 'number',
      max: 10
    },
    getTilt: {
      type: 'number',
      min: -90,
      max: 90
    }
  },
  props: {
    id: 'arcLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    getHeight: d => 1,
    getTilt: d => 0,
    pickable: true
  }
};

const IconLayerExample = {
  layer: IconLayer,
  getData: () => dataSamples.points,
  props: {
    iconAtlas: 'data/icon-atlas.png',
    iconMapping: dataSamples.iconAtlas,
    sizeScale: 24,
    getPosition: d => d.COORDINATES,
    getColor: d => [64, 64, 72],
    getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
    getSize: d => (d.RACKS > 2 ? 2 : 1),
    opacity: 0.8,
    pickable: true
  }
};

const IconLayerAutoPackingExample = {
  layer: IconLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'icon-layer-auto-packing',
    sizeScale: 24,
    getPosition: d => d.COORDINATES,
    getColor: d => [64, 64, 72],
    getIcon: d => {
      if (d.PLACEMENT === 'SW') {
        return {
          url: 'data/icon-marker.png',
          width: 64,
          height: 64,
          anchorY: 64,
          mask: true
        };
      }
      return {
        id: 'warning',
        url: 'data/icon-warning.png',
        width: 128,
        height: 128,
        anchorY: 128,
        mask: false
      };
    },
    getSize: d => {
      return d.RACKS > 2 ? 2 : 1;
    },
    opacity: 0.8,
    pickable: true
  }
};

const GeoJsonLayerExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.geojson,
  propTypes: {
    getDashArray: {type: 'compound', elements: ['dashSizeLine']},
    dashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getDashArray', [newValue, 20 - newValue]);
      }
    }
  },
  props: {
    id: 'geojsonLayer',
    getPointRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
    getFillColor: f => {
      const color = parseColor(f.properties.fill || f.properties['marker-color']);
      const opacity = (f.properties['fill-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getLineColor: f => {
      const color = parseColor(f.properties.stroke);
      const opacity = (f.properties['stroke-opacity'] || 1) * 255;
      return setOpacity(color, opacity);
    },
    getDashArray: f => [20, 0],
    getLineWidth: f => f.properties['stroke-width'],
    getElevation: f => 500,
    lineWidthScale: 10,
    lineWidthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    dashGapPickable: true,
    extensions: [new PathStyleExtension({dash: true})]
  }
};

const GeoJsonLayerExtrudedExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.choropleths,
  props: {
    id: 'geojsonLayer-extruded',
    getElevation: f => ((f.properties.ZIP_CODE * 10) % 127) * 10,
    getFillColor: f => [0, 100, (f.properties.ZIP_CODE * 55) % 255],
    getLineColor: f => [200, 0, 80],
    extruded: true,
    wireframe: true,
    pickable: true
  }
};

const PolygonLayerExample = {
  layer: PolygonLayer,
  getData: () => dataSamples.polygons,
  propTypes: {
    getDashArray: {type: 'compound', elements: ['dashSizeLine']},
    dashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getDashArray', [newValue, 20 - newValue]);
      }
    }
  },
  props: {
    getPolygon: f => f,
    getFillColor: f => [200 + Math.random() * 55, 0, 0],
    getLineColor: f => [0, 0, 0, 255],
    getDashArray: f => [20, 0],
    getLineWidth: f => 20,
    getElevation: f => Math.random() * 1000,
    opacity: 0.8,
    pickable: true,
    dashJustified: true,
    elevationScale: 0.6,
    extensions: [new PathStyleExtension({dash: true})]
  }
};

const PolygonLayerBinaryExample = {
  ...PolygonLayerExample,
  getData: () =>
    dataSamples.polygons.map(polygon => {
      // Convert each polygon from an array of points to an array of numbers
      return flattenVertices(polygon, {dimensions: 2});
    }),
  props: {
    ...PolygonLayerExample.props,
    getPolygon: d => d,
    positionFormat: 'XY',

    fillPatternAtlas: 'data/pattern.png',
    fillPatternMapping: 'data/pattern.json',
    getFillPattern: f =>
      ['hatch-1x', 'hatch-2x', 'hatch-cross', 'dots'][Math.floor(Math.random() * 4)],
    getFillPatternOffset: [0, 0],
    getFillPatternScale: 5,
    extensions: [new FillStyleExtension({pattern: true})]
  }
};

const PathLayerExample = {
  layer: PathLayer,
  getData: () => dataSamples.zigzag,
  propTypes: {
    getDashArray: {type: 'compound', elements: ['dashSizeLine']},
    dashSizeLine: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('getDashArray', [newValue, 20 - newValue]);
      }
    },
    getOffset: {
      type: 'number',
      min: -2,
      max: 2
    }
  },
  props: {
    id: 'pathLayer',
    opacity: 0.6,
    getPath: f => f.path,
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    getDashArray: f => [20, 0],
    getOffset: 0,
    widthMinPixels: 1,
    pickable: true,
    dashJustified: true,
    extensions: [new PathStyleExtension({dash: true, offset: true, highPrecisionDash: true})]
  }
};

const LineLayerExample = {
  layer: LineLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'lineLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
    pickable: true
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'scatterplotLayer',
    getPosition: d => d.COORDINATES,
    getFillColor: d => [255, 128, 0],
    getLineColor: d => [0, 128, 255],
    getRadius: d => d.SPACES,
    opacity: 1,
    pickable: true,
    radiusScale: 30,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const ColumnLayerExample = {
  layer: ColumnLayer,
  props: {
    id: 'columnLayer',
    data: dataSamples.worldGrid.data,
    extruded: true,
    pickable: true,
    radius: 100,
    opacity: 1,
    getFillColor: d => [245, 166, d.value * 255, 255],
    getElevation: d => d.value * 5000
  }
};

/*
const ColumnLayerExample = {
  layer: ColumnLayer,
  props: {
    id: 'ColumnLayer',
    data: dataSamples.hexagons,
    radius: 100,
    diskResolution: 6,
    coverage: 1,
    extruded: true,
    pickable: true,
    opacity: 1,
    getPosition: d => d.centroid,
    getColor: d => [48, 128, d.value * 255, 255],
    getElevation: d => d.value * 5000
  }
};
*/

const TextLayerExample = {
  layer: TextLayer,
  getData: () => dataSamples.texts,
  propTypes: {
    fontFamily: {
      name: 'fontFamily',
      type: 'category',
      value: ['Monaco', 'Helvetica', 'Garamond', 'Palatino', 'Courier', 'Courier New']
    },
    fontWeight: {
      type: 'category',
      max: 100,
      value: [
        'normal',
        'bold',
        'bolder',
        'lighter',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900'
      ]
    },
    fontSettings: {
      type: 'compound',
      elements: ['fontSize', 'buffer', 'sdf', 'radius', 'cutoff']
    },
    fontSize: {
      type: 'number',
      max: 100,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, fontSize: newValue});
      }
    },
    buffer: {
      type: 'number',
      max: 100,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, buffer: newValue});
      }
    },
    sdf: {
      type: 'boolean',
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, sdf: newValue});
      }
    },
    radius: {
      type: 'number',
      max: 20,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, radius: newValue});
      }
    },
    cutoff: {
      type: 'number',
      max: 1,
      onUpdate: (newValue, newSettings, change) => {
        change('fontSettings', {...newSettings.fontSettings, cutoff: newValue});
      }
    },
    wordBreak: {
      name: 'wordBreak',
      type: 'category',
      value: ['', 'break-all', 'break-word']
    },
    getTextAnchor: {
      name: 'textAnchor',
      type: 'category',
      value: ['start', 'middle', 'end']
    },
    maxWidth: {
      name: 'maxWidth',
      type: 'number',
      max: 5000
    },
    backgroundPadding: {type: 'compound', elements: ['padding']},
    padding: {
      type: 'number',
      max: 100,
      onUpdate: (newValue, newSettings, change) => {
        change('backgroundPadding', [newValue, newValue]);
      }
    }
  },
  props: {
    id: 'textgetAnchorX-layer',
    sizeScale: 1,
    fontFamily: 'Monaco',
    fontSettings: {},
    autoHighlight: true,
    pickable: true,
    maxWidth: 500,
    wordBreak: 'break-word',
    highlightColor: [0, 0, 128, 128],
    getText: x => `${x.LOCATION_NAME}\n${x.ADDRESS}`,
    getPosition: x => x.COORDINATES,
    getColor: x => [153, 0, 0],
    background: false,
    getBackgroundColor: x => [255, 255, 255],
    getBorderColor: x => [0, 0, 0],
    getBorderWidth: 0,
    getAngle: x => 30,
    getTextAnchor: x => 'middle',
    getAlignmentBaseline: x => 'center',
    getPixelOffset: x => [10, 0]
  }
};

const BitmapLayerExample = {
  layer: BitmapLayer,
  props: {
    id: 'bitmap-layer',
    image: 'data/sf-districts.png',
    bounds: [-122.519, 37.7045, -122.355, 37.829]
  }
};

/* eslint-disable quote-props */
export default {
  'Core Layers - LngLat': {
    GeoJsonLayer: GeoJsonLayerExample,
    'GeoJsonLayer (Extruded)': GeoJsonLayerExtrudedExample,
    PolygonLayer: PolygonLayerExample,
    'PolygonLayer (Flat)': PolygonLayerBinaryExample,
    PathLayer: PathLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    IconLayer: IconLayerExample,
    'IconLayer (auto packing)': IconLayerAutoPackingExample,
    TextLayer: TextLayerExample,
    BitmapLayer: BitmapLayerExample,
    ColumnLayer: ColumnLayerExample
  }
};
