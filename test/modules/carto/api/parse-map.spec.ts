// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {parseMap} from '@deck.gl/carto/api/parse-map';
import {GeoJsonLayer} from '@deck.gl/layers';
import {H3TileLayer, QuadbinTileLayer, VectorTileLayer, HeatmapTileLayer} from '@deck.gl/carto';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import {GridLayer, HeatmapLayer, HexagonLayer} from '@deck.gl/aggregation-layers';

const METADATA = {
  id: 1234,
  title: 'Title',
  description: 'Description',
  createdAt: 'createdAt timestamp',
  updatedAt: 'updatedAt timestamp',
  token: 'API_TOKEN'
};

const EMPTY_KEPLER_MAP_CONFIG = {
  version: 'v1',
  config: {
    mapState: 'INITIAL_VIEW_STATE',
    mapStyle: 'MAP_STYLE',
    visState: {
      layers: []
    }
  }
};

const tilestats = {
  layers: [
    {
      attributes: [
        {
          attribute: 'STRING_ATTR',
          categories: [{category: '1'}, {category: '2'}, {category: '3'}]
        },
        {
          attribute: 'NUMBER_ATTR',
          min: 0,
          max: 10
        }
      ]
    }
  ]
};
const DATASETS = [
  {
    id: 'DATA_ID',
    data: {type: 'FeatureCollection', features: []}
  },
  {
    id: 'DATA_JSON_ID',
    data: []
  },
  {
    id: 'DATA_TILESET_ID',
    data: {
      tiles: [
        `https://gcp-us-east1.api.carto.com/v3/maps/my_connection/tileset/{z}/{x}/{y}?name=my_data&formatTiles=mvt`
      ],
      tilestats
    },
    type: 'tileset'
  },
  {
    id: 'DATA_TILESET_GEOJSON_FORMAT_ID',
    data: {
      tiles: [
        `https://gcp-us-east1.api.carto.com/v3/maps/my_connection/tileset/{z}/{x}/{y}?name=my_data&formatTiles=geojson`
      ],
      tilestats
    },
    type: 'tileset'
  },
  {
    id: 'DATA_TILESET_BINARY_FORMAT_ID',
    data: {
      tiles: [
        `https://gcp-us-east1.api.carto.com/v3/maps/my_connection/tileset/{z}/{x}/{y}?name=my_data&formatTiles=binary`
      ],
      tilestats
    },
    type: 'tileset'
  },
  {
    id: 'DATA_TILESET_H3_ID',
    data: {
      scheme: 'h3',
      tiles: [
        `https://gcp-us-east1.api.carto.com/v3/maps/my_connection/tileset/{i}?name=my_data&formatTiles=json&spatialIndex=h3`
      ],
      tilestats
    },
    type: 'tileset'
  },
  {
    id: 'DATA_TILESET_QUADBIN_ID',
    data: {
      scheme: 'quadbin',
      tiles: [
        `https://gcp-us-east1.api.carto.com/v3/maps/my_connection/tileset/{i}?name=my_data&formatTiles=json&spatialIndex=quadbin`
      ],
      tilestats
    },
    type: 'tileset'
  }
];

test('parseMap#invalid version', () => {
  const json = {
    ...METADATA,
    keplerMapConfig: {...EMPTY_KEPLER_MAP_CONFIG, version: 'invalid'}
  };
  expect(() => parseMap(json), 'Throws on invalid Kepler schema version').toThrow(
    /Only support Kepler v1/
  );
});

test('parseMap#metadata', () => {
  const json = {
    ...METADATA,
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG
  };
  const {layers, initialViewState, mapStyle, ...metadata} = parseMap(json);
  expect(metadata, 'Metadata is passed through').toEqual(METADATA);
  expect(initialViewState, 'Map state is passed through').toEqual('INITIAL_VIEW_STATE');
  expect(mapStyle, 'Map style is passed through').toEqual('MAP_STYLE');
});

test(`parseMap#visState empty`, async () => {
  const keplerMapConfig = {version: 'v1', config: {visState: {layers: []}}};
  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});
  expect(map.layers, 'layers empty').toEqual([]);
});

test(`parseMap#visState point`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'ab2417x',
            type: 'point',
            config: {
              color: [18, 147, 154],
              label: 'Stores',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude', altitude: 'altitude'},
              isVisible: true,
              textLabel: [],
              visConfig: {
                filled: true,
                radius: 20.2,
                opacity: 0.42,
                outline: true,
                thickness: 4.5,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                fixedRadius: false,
                radiusRange: [0, 50],
                strokeColor: [232, 250, 250],
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: {name: 'size_m2', type: 'integer'},
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '0424a64c-8ba1-4ee9-a5ab-9f5d58f065f6': [
                {name: 'cartodb_id', format: null},
                {name: 'storetype', format: null},
                {name: 'address', format: null},
                {name: 'city', format: null},
                {name: 'state', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`GeoJsonLayer({id: 'ab2417x'})`]);

  const layer = map.layers[0] as GeoJsonLayer;
  expect(layer.props.id, 'id').toBe('ab2417x');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.pointType, 'pointType').toBe('circle');
  expect(layer.props.getFillColor, 'pointType').toEqual([18, 147, 154, 172]);
  expect(layer.props.lineMiterLimit, 'lineMiterLimit').toBe(2);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Stores');
});

test(`parseMap#visState point + labels`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'vlu4f7d',
            type: 'point',
            config: {
              color: [18, 147, 154],
              label: 'Stores',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude', altitude: null},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: {name: 'city', type: 'string'},
                  anchor: 'end',
                  offset: [0, 0],
                  alignment: 'top'
                },
                {
                  size: 12,
                  color: [121, 9, 77],
                  outlineColor: [123, 0, 255],
                  field: {name: 'state', type: 'string'},
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 20.2,
                opacity: 0.42,
                outline: true,
                thickness: 4.5,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                fixedRadius: false,
                radiusRange: [0, 50],
                strokeColor: [232, 250, 250],
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: {name: 'size_m2', type: 'integer'},
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'additive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '0424a64c-8ba1-4ee9-a5ab-9f5d58f065f6': [
                {name: 'cartodb_id', format: null},
                {name: 'storetype', format: null},
                {name: 'address', format: null},
                {name: 'city', format: null},
                {name: 'state', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`GeoJsonLayer({id: 'vlu4f7d'})`]);

  const layer = map.layers[0] as GeoJsonLayer;
  expect(layer.props.id, 'id').toBe('vlu4f7d');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.pointType, 'pointType').toBe('circle+text');
  expect(layer.props.getFillColor, 'pointType').toEqual([18, 147, 154, 172]);
  expect(layer.props.lineMiterLimit, 'lineMiterLimit').toBe(2);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Stores');
});

test(`parseMap#visState point + label + single marker`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'tyxi12',
            type: 'point',
            config: {
              color: [18, 147, 154],
              label: 'Stores',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude', altitude: null},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: {name: 'city', type: 'string'},
                  anchor: 'end',
                  offset: [0, 0],
                  alignment: 'top'
                }
              ],
              visConfig: {
                filled: true,
                radius: 20.2,
                opacity: 0.42,
                outline: true,
                thickness: 4.5,
                customMarkers: true,
                customMarkersUrl: 'https://icon.somewhere.com/icon.svg',
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                fixedRadius: false,
                radiusRange: [0, 50],
                strokeColor: [232, 250, 250],
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: {name: 'size_m2', type: 'integer'},
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'additive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '0424a64c-8ba1-4ee9-a5ab-9f5d58f065f6': [
                {name: 'cartodb_id', format: null},
                {name: 'storetype', format: null},
                {name: 'address', format: null},
                {name: 'city', format: null},
                {name: 'state', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`GeoJsonLayer({id: 'tyxi12'})`]);

  const layer = map.layers[0] as GeoJsonLayer;
  expect(layer.props.id, 'id').toBe('tyxi12');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.pointType, 'pointType').toBe('icon+text');
  expect(layer.props.getIconColor, 'pointType').toEqual([18, 147, 154]);
  expect(layer.props.lineMiterLimit, 'lineMiterLimit').toBe(2);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Stores');
});

test(`parseMap#visState point + multi markers`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'baksj12',
            type: 'point',
            config: {
              color: [18, 147, 154],
              label: 'Stores',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude', altitude: null},
              isVisible: true,
              textLabel: [],
              visConfig: {
                filled: true,
                radius: 32,
                opacity: 0.42,
                outline: true,
                thickness: 4.5,
                customMarkers: true,
                customMarkersUrl: 'https://icon.somewhere.com/icon.svg',
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                fixedRadius: false,
                radiusRange: [0, 50],
                strokeColor: [232, 250, 250],
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                customMarkersRange: {
                  markerMap: [
                    {value: 'Supermarket', markerUrl: 'https://example.com/icon.svg'},
                    {value: 'Drugstore', markerUrl: 'https://example.com/2.svg'}
                  ],
                  othersMarker: 'https://example.com/2.svg'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: {name: 'size_m2', type: 'integer'},
              strokeColorScale: 'quantile',
              customMarkersField: {name: 'storetype', type: 'string'},
              customMarkersScale: 'ordinal'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'additive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '0424a64c-8ba1-4ee9-a5ab-9f5d58f065f6': [
                {name: 'cartodb_id', format: null},
                {name: 'storetype', format: null},
                {name: 'address', format: null},
                {name: 'city', format: null},
                {name: 'state', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`GeoJsonLayer({id: 'baksj12'})`]);

  const layer = map.layers[0] as GeoJsonLayer;
  expect(layer.props.id, 'id').toBe('baksj12');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.pointType, 'pointType').toBe('icon');
  expect(layer.props.getIconColor, 'pointType').toEqual([18, 147, 154]);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Stores');
});

test(`parseMap#visState tileset point and line`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: '87swuny',
            type: 'mvt',
            config: {
              color: [18, 147, 154],
              label: 'transmission lines',
              dataId: 'DATA_TILESET_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 10,
                opacity: 0.8,
                stroked: true,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 0.6,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: [250, 116, 0],
                strokeOpacity: 0.8,
                elevationScale: 5,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              heightField: null,
              heightScale: 'linear',
              radiusField: null,
              radiusScale: 'linear',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          },
          {
            id: 'w04u776',
            type: 'geojson',
            config: {
              color: [231, 159, 213],
              label: 'boundary',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {geojson: 'geom'},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: false,
                radius: 10,
                opacity: 0.8,
                stroked: true,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 5.2,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: [77, 181, 217],
                strokeOpacity: 0.8,
                elevationScale: 5,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                enableElevationZoomFactor: true
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              heightField: null,
              heightScale: 'linear',
              radiusField: null,
              radiusScale: 'linear',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          },
          {
            id: 'iim6w8',
            type: 'point',
            config: {
              color: [87, 173, 87],
              label: 'Layer 3',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude', altitude: null},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 35.8,
                opacity: 0.8,
                outline: false,
                thickness: 2,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                fixedRadius: false,
                radiusRange: [0, 50],
                strokeColor: null,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'subtractive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '6184df9c-bb75-4fa3-abe5-e3b51bc1e63b': [],
              '6da2452e-0390-4392-88ae-b8314cd68060': [],
              'b3079c06-4ce1-4030-85a0-db79865a5e80': [
                {name: 'type', format: null},
                {name: 'name', format: null},
                {name: 'location', format: null},
                {name: 'capacity_mw', format: null},
                {name: 'year_opened', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([
    `GeoJsonLayer({id: 'iim6w8'})`,
    `GeoJsonLayer({id: 'w04u776'})`,
    `VectorTileLayer({id: '87swuny'})`
  ]);

  const circleLayer = map.layers[0] as GeoJsonLayer;
  expect(circleLayer.props.id, 'circleLayer - id').toBe('iim6w8');
  expect(circleLayer.props.pointType, 'circleLayer - pointType').toBe('circle');
  expect(circleLayer.props.filled, 'circleLayer - filled').toBe(true);
  expect(circleLayer.props.stroked, 'circleLayer - stroked').toBe(false);
  expect((circleLayer.props as any).cartoLabel, 'circleLayer - cartoLabel').toBe('Layer 3');

  const boundaryLayer = map.layers[1] as GeoJsonLayer;
  expect(boundaryLayer.props.id, 'boundaryLayer - id').toBe('w04u776');
  expect(boundaryLayer.props.filled, 'boundaryLayer - filled').toBe(false);
  expect(boundaryLayer.props.stroked, 'boundaryLayer - stroked').toBe(true);
  expect((boundaryLayer.props as any).cartoLabel, 'boundaryLayer - cartoLabel').toBe('boundary');

  const mvtLayer = map.layers[2] as VectorTileLayer;
  expect(mvtLayer.props.id, 'mvtLayer - id').toBe('87swuny');
  expect(mvtLayer.props.uniqueIdProperty, 'mvtLayer - uniqueIdProperty').toBe('geoid');
  expect(mvtLayer.props.filled, 'mvtLayer - filled').toBe(true);
  expect(mvtLayer.props.stroked, 'mvtLayer - stroked').toBe(true);
  expect((mvtLayer.props as any).cartoLabel, 'mvtLayer - cartoLabel').toBe('transmission lines');
});

test(`parseMap#visState hexagon`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'jc4657',
            type: 'hexagonId',
            config: {
              color: [225, 49, 106],
              label: 'Population',
              dataId: 'DATA_ID',
              hidden: false,
              columns: {hex_id: 'h3'},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                opacity: 0.8,
                coverage: 0.9,
                enable3d: true,
                sizeRange: [0, 1000],
                colorRange: {
                  name: 'ColorBrewer RdPu-5',
                  type: 'sequential',
                  colors: ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'],
                  category: 'ColorBrewer'
                },
                coverageRange: [0, 1],
                elevationScale: 70.1,
                enableElevationZoomFactor: true
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: {name: 'pop', type: 'integer'},
              sizeScale: 'ordinal',
              colorField: {name: 'pop', type: 'integer'},
              colorScale: 'quantile',
              coverageField: null,
              coverageScale: 'linear'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'additive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '449d39e6-c637-4317-a88c-061f720b2786': [],
              '69bbdd03-4e8a-4927-9fa4-e38836c6c7ba': [
                {name: 'h3', format: null},
                {name: 'pop', format: null}
              ],
              'fb3901f4-224a-4365-8535-393365706e5d': [
                {name: 'fips_code', format: null},
                {name: 'name', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`H3HexagonLayer({id: 'jc4657'})`]);

  const layer = map.layers[0] as H3HexagonLayer;
  expect(layer.props.id, 'id').toBe('jc4657');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.stroked, 'stroked').toBe(false);
  expect(layer.props.extruded, 'extruded').toBe(true);
  expect(layer.props.elevationScale, 'elevationScale').toBe(70.1);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Population');
});

test(`parseMap#visState Polygon tileset`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: '3btkipv',
            type: 'mvt',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_TILESET_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 10,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 0.5,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: [221, 178, 124],
                strokeOpacity: 0.8,
                elevationScale: 5,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: {name: 'STRING_ATTR', type: 'string'},
              colorScale: 'ordinal',
              heightField: {name: 'NUMBER_ATTR', type: 'number'},
              heightScale: 'log',
              radiusField: null,
              radiusScale: 'log',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '4eebbc75-4331-409e-8c71-16ed67429177': [
                {name: 'geoid', format: null},
                {name: 'construction_date', format: null},
                {name: 'current_use', format: null},
                {name: 'number_floors_above_ground', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`VectorTileLayer({id: '3btkipv'})`]);

  const layer = map.layers[0] as VectorTileLayer;
  expect(layer.props.id, 'id').toBe('3btkipv');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.filled, 'filled').toBe(true);
  expect(layer.props.stroked, 'stroked').toBe(false);
  expect(layer.props.extruded, 'extruded').toBe(false);
  expect(layer.props.uniqueIdProperty, 'elevationScale').toBe('geoid');
  expect(layer.props.getLineColor, 'getLineColor').toEqual([221, 178, 124, 230]);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState Polygon tileset geojson format`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'kajdi11',
            type: 'tileset',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_TILESET_GEOJSON_FORMAT_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 10,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 0.5,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: [221, 178, 124],
                strokeOpacity: 0.8,
                elevationScale: 5,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: {name: 'STRING_ATTR', type: 'string'},
              colorScale: 'ordinal',
              heightField: {name: 'NUMBER_ATTR', type: 'number'},
              heightScale: 'log',
              radiusField: null,
              radiusScale: 'log',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '4eebbc75-4331-409e-8c71-16ed67429177': [
                {name: 'geoid', format: null},
                {name: 'construction_date', format: null},
                {name: 'current_use', format: null},
                {name: 'number_floors_above_ground', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`VectorTileLayer({id: 'kajdi11'})`]);

  const layer = map.layers[0] as VectorTileLayer;
  expect(layer.props.id, 'id').toBe('kajdi11');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.filled, 'filled').toBe(true);
  expect(layer.props.stroked, 'stroked').toBe(false);
  expect(layer.props.extruded, 'extruded').toBe(false);
  expect(layer.props.uniqueIdProperty, 'elevationScale').toBe('geoid');
  expect(layer.props.getLineColor, 'getLineColor').toEqual([221, 178, 124, 230]);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState Polygon tileset binary format`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: '91kajsh',
            type: 'tileset',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_TILESET_BINARY_FORMAT_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 10,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 0.5,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: [221, 178, 124],
                strokeOpacity: 0.8,
                elevationScale: 5,
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                }
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: {name: 'STRING_ATTR', type: 'string'},
              colorScale: 'ordinal',
              heightField: {name: 'NUMBER_ATTR', type: 'number'},
              heightScale: 'log',
              radiusField: null,
              radiusScale: 'log',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '4eebbc75-4331-409e-8c71-16ed67429177': [
                {name: 'geoid', format: null},
                {name: 'construction_date', format: null},
                {name: 'current_use', format: null},
                {name: 'number_floors_above_ground', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`VectorTileLayer({id: '91kajsh'})`]);

  const layer = map.layers[0] as VectorTileLayer;
  expect(layer.props.id, 'id').toBe('91kajsh');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.filled, 'filled').toBe(true);
  expect(layer.props.stroked, 'stroked').toBe(false);
  expect(layer.props.extruded, 'extruded').toBe(false);
  expect(layer.props.pointType, 'pointType').toBe('circle');
  expect(layer.props.uniqueIdProperty, 'elevationScale').toBe('geoid');
  expect(layer.props.getLineColor, 'getLineColor').toEqual([221, 178, 124, 230]);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState Grid layer`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'ij06t3e',
            type: 'grid',
            config: {
              color: [137, 218, 193],
              label: 'Layer 1',
              dataId: 'DATA_JSON_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude'},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                opacity: 0.8,
                coverage: 1,
                enable3d: false,
                sizeRange: [0, 500],
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                percentile: [0, 100],
                worldUnitSize: 0.5,
                elevationScale: 5,
                sizeAggregation: 'count',
                colorAggregation: 'count',
                elevationPercentile: [0, 100],
                enableElevationZoomFactor: true
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {
          speed: 1,
          currentTime: null
        },
        interactionConfig: {
          brush: {
            size: 0.5,
            enabled: false
          },
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              'c2ab5ce4-3ecd-4032-9cb4-33e5e8e800da': [
                {
                  name: 'cartodb_id',
                  format: null
                },
                {
                  name: 'injuries',
                  format: null
                },
                {
                  name: 'x',
                  format: null
                },
                {
                  name: 'y',
                  format: null
                },
                {
                  name: 'objectid',
                  format: null
                }
              ]
            }
          },
          geocoder: {
            enabled: false
          },
          coordinate: {
            enabled: false
          }
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`GridLayer({id: 'ij06t3e'})`]);

  const layer = map.layers[0] as GridLayer;
  expect(layer.props.id, 'id').toBe('ij06t3e');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.elevationScale, 'elevationScale').toBe(5);
  expect(layer.props.colorAggregation, 'colorAggregation').toBe('SUM');
  expect(layer.props.colorRange, 'colorRange').toEqual([
    [90, 24, 70, 255],
    [144, 12, 63, 255],
    [199, 0, 57, 255],
    [227, 97, 28, 255],
    [241, 146, 14, 255],
    [255, 195, 0, 255]
  ]);
  expect(layer.props.coverage, 'coverage').toBe(1);
  expect(layer.props.elevationLowerPercentile, 'elevationLowerPercentile').toBe(0);
  expect(layer.props.elevationUpperPercentile, 'elevationUpperPercentile').toBe(100);
  expect(layer.props.cellSize, 'cellSize').toBe(500);
  expect(layer.props.colorScaleType, 'colorScaleType').toBe('quantile');
  expect(layer.props.extruded, 'extruded').toBe(false);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState Hex Bin Layer`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'ja1357',
            type: 'hexagon',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_JSON_ID',
              hidden: false,
              columns: {lat: 'latitude', lng: 'longitude'},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                opacity: 0.8,
                coverage: 1,
                enable3d: false,
                sizeRange: [0, 500],
                colorRange: {
                  name: 'ColorBrewer YlGn-6',
                  type: 'sequential',
                  colors: ['#ffffcc', '#d9f0a3', '#addd8e', '#78c679', '#31a354', '#006837'],
                  category: 'ColorBrewer'
                },
                percentile: [0, 100],
                resolution: 8,
                worldUnitSize: 0.3,
                elevationScale: 5,
                sizeAggregation: 'count',
                colorAggregation: 'count',
                elevationPercentile: [0, 100],
                enableElevationZoomFactor: true
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {
          speed: 1,
          currentTime: null
        },
        interactionConfig: {
          brush: {
            size: 0.5,
            enabled: false
          },
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '808481b4-9e88-4ccd-85fe-2bcc2b056be8': [
                {
                  name: 'cartodb_id',
                  format: null
                },
                {
                  name: 'injuries',
                  format: null
                },
                {
                  name: 'x',
                  format: null
                },
                {
                  name: 'y',
                  format: null
                },
                {
                  name: 'objectid',
                  format: null
                }
              ]
            }
          },
          geocoder: {
            enabled: false
          },
          coordinate: {
            enabled: false
          }
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`HexagonLayer({id: 'ja1357'})`]);

  const layer = map.layers[0] as HexagonLayer<unknown>;
  expect(layer.props.id, 'id').toBe('ja1357');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.elevationScale, 'elevationScale').toBe(5);
  expect(layer.props.colorAggregation, 'colorAggregation').toBe('SUM');
  expect(layer.props.colorRange, 'colorRange').toEqual([
    [255, 255, 204, 255],
    [217, 240, 163, 255],
    [173, 221, 142, 255],
    [120, 198, 121, 255],
    [49, 163, 84, 255],
    [0, 104, 55, 255]
  ]);
  expect(layer.props.coverage, 'coverage').toBe(1);
  expect(layer.props.lowerPercentile, 'elevationLowerPercentile').toBe(0);
  expect(layer.props.upperPercentile, 'elevationUpperPercentile').toBe(100);
  expect(layer.props.elevationLowerPercentile, 'elevationLowerPercentile').toBe(0);
  expect(layer.props.elevationUpperPercentile, 'elevationUpperPercentile').toBe(100);
  expect(layer.props.radius, 'cellSize').toBe(300);
  expect(layer.props.colorScaleType, 'colorScaleType').toBe('quantile');
  expect(layer.props.extruded, 'extruded').toBe(false);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState Heatmap Layer`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'fcpl61l',
            type: 'heatmap',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_JSON_ID',
              hidden: false,
              columns: {
                lat: 'latitude',
                lng: 'longitude'
              },
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                radius: 21.7,
                opacity: 0.8,
                coverage: 1,
                enable3d: false,
                sizeRange: [0, 500],
                colorRange: {
                  name: 'ColorBrewer OrRd-6',
                  type: 'sequential',
                  colors: ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
                  category: 'ColorBrewer'
                },
                percentile: [0, 100],
                resolution: 8,
                worldUnitSize: 1,
                elevationScale: 5,
                sizeAggregation: 'average',
                colorAggregation: 'average',
                elevationPercentile: [0, 100],
                enableElevationZoomFactor: true
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              weightField: null
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'normal',
        animationConfig: {
          speed: 1,
          currentTime: null
        },
        interactionConfig: {
          brush: {
            size: 0.5,
            enabled: false
          },
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '681ac9b5-ee51-4038-ae8d-dd64b79968a6': [
                {
                  name: 'cartodb_id',
                  format: null
                },
                {
                  name: 'injuries',
                  format: null
                },
                {
                  name: 'x',
                  format: null
                },
                {
                  name: 'y',
                  format: null
                },
                {
                  name: 'objectid',
                  format: null
                }
              ]
            }
          },
          geocoder: {
            enabled: false
          },
          coordinate: {
            enabled: false
          }
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`HeatmapLayer({id: 'fcpl61l'})`]);

  const layer = map.layers[0] as HeatmapLayer<unknown>;
  expect(layer.props.id, 'id').toBe('fcpl61l');
  expect(layer.props.pickable, 'pickable').toBe(true);
  expect(layer.props.visible, 'visible').toBe(true);
  expect(layer.props.intensity, 'intensity').toBe(1);
  expect(layer.props.radiusPixels, 'radiusPixels').toBe(21.7);
  expect(layer.props.colorRange, 'colorRange').toEqual([
    [254, 240, 217, 255],
    [253, 212, 158, 255],
    [253, 187, 132, 255],
    [252, 141, 89, 255],
    [227, 74, 51, 255],
    [179, 0, 0, 255]
  ]);
  expect((layer.props as any).cartoLabel, 'cartoLabel').toBe('Layer 1');
});

test(`parseMap#visState tilesets spatial index`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'a6bbdbj',
            type: 'quadbin',
            config: {
              color: [246, 209, 138],
              label: 'Layer 2',
              dataId: 'DATA_TILESET_QUADBIN_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 2,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 1,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: null,
                strokeOpacity: 0.8,
                elevationScale: 5,
                colorAggregation: 'average',
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightAggregation: 'average'
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              heightField: null,
              heightScale: 'linear',
              radiusField: null,
              radiusScale: 'linear',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          },
          {
            id: 'y64lw8',
            type: 'h3',
            config: {
              color: [18, 147, 154],
              label: 'Layer 1',
              dataId: 'DATA_TILESET_H3_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 2,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 1,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: null,
                strokeOpacity: 0.8,
                elevationScale: 5,
                colorAggregation: 'average',
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightAggregation: 'average'
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: {name: 'NUMBER_ATTR', type: 'number'},
              colorScale: 'quantize',
              heightField: null,
              heightScale: 'linear',
              radiusField: null,
              radiusScale: 'linear',
              strokeColorField: null,
              strokeColorScale: 'quantile'
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'subtractive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '6184df9c-bb75-4fa3-abe5-e3b51bc1e63b': [],
              '6da2452e-0390-4392-88ae-b8314cd68060': [],
              'b3079c06-4ce1-4030-85a0-db79865a5e80': [
                {name: 'type', format: null},
                {name: 'name', format: null},
                {name: 'location', format: null},
                {name: 'capacity_mw', format: null},
                {name: 'year_opened', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`H3TileLayer({id: 'y64lw8'})`, `QuadbinTileLayer({id: 'a6bbdbj'})`]);

  const h3Layer = map.layers[0] as H3TileLayer;
  expect(h3Layer.props.id, 'h3lLayer - id').toBe('y64lw8');
  expect(h3Layer.props.pickable, 'h3lLayer - pickable').toBe(true);
  expect(h3Layer.props.visible, 'h3lLayer - visible').toBe(true);
  expect(h3Layer.props.filled, 'h3lLayer - filled').toBe(true);
  expect(h3Layer.props.stroked, 'h3lLayer - stroked').toBe(false);
  expect((h3Layer.props as any).cartoLabel, 'h3lLayer - cartoLabel').toBe('Layer 1');

  const quadbinLayer = map.layers[1] as QuadbinTileLayer;
  expect(quadbinLayer.props.id, 'quadbinLayer - id').toBe('a6bbdbj');
  expect(quadbinLayer.props.pickable, 'quadbinLayer - pickable').toBe(true);
  expect(quadbinLayer.props.visible, 'quadbinLayer - visible').toBe(true);
  expect(quadbinLayer.props.filled, 'quadbinLayer - filled').toBe(true);
  expect(quadbinLayer.props.stroked, 'quadbinLayer - stroked').toBe(false);
  expect(quadbinLayer.props.getFillColor, 'quadbinLayer - getFillColor').toEqual([
    246, 209, 138, 230
  ]);
  expect((quadbinLayer.props as any).cartoLabel, 'quadbinLayer - cartoLabel').toBe('Layer 2');
});

test(`parseMap#visState HeatmapTileLayer`, async () => {
  const keplerMapConfig = {
    version: 'v1',
    config: {
      visState: {
        layers: [
          {
            id: 'a6bbdbj',
            type: 'heatmapTile',
            config: {
              color: [246, 209, 138],
              label: 'Layer 2',
              dataId: 'DATA_TILESET_QUADBIN_ID',
              hidden: false,
              columns: {},
              isVisible: true,
              textLabel: [
                {
                  size: 18,
                  color: [255, 255, 255],
                  outlineColor: [0, 0, 0],
                  field: null,
                  anchor: 'start',
                  offset: [0, 0],
                  alignment: 'center'
                }
              ],
              visConfig: {
                filled: true,
                radius: 17.3,
                opacity: 0.8,
                stroked: false,
                enable3d: false,
                sizeRange: [0, 10],
                thickness: 1,
                wireframe: false,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#ff0000', '#00ff00', '#0000ff', '#fc8d59', '#e34a33', '#b30000'],
                  category: 'Uber'
                },
                heightRange: [0, 500],
                radiusRange: [0, 50],
                strokeColor: null,
                strokeOpacity: 0.8,
                elevationScale: 5,
                colorAggregation: 'average',
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                  category: 'Uber'
                },
                heightAggregation: 'average'
              },
              highlightColor: [252, 242, 26, 255]
            },
            visualChannels: {
              sizeField: null,
              sizeScale: 'linear',
              colorField: null,
              colorScale: 'quantile',
              heightField: null,
              heightScale: 'linear',
              radiusField: null,
              radiusScale: 'linear',
              strokeColorField: null,
              strokeColorScale: 'quantile',
              weightField: {name: 'ride_count', type: 'integer'}
            }
          }
        ],
        filters: [],
        splitMaps: [],
        layerBlending: 'subtractive',
        animationConfig: {speed: 1, currentTime: null},
        interactionConfig: {
          brush: {size: 0.5, enabled: false},
          tooltip: {
            enabled: true,
            compareMode: false,
            compareType: 'absolute',
            fieldsToShow: {
              '6184df9c-bb75-4fa3-abe5-e3b51bc1e63b': [],
              '6da2452e-0390-4392-88ae-b8314cd68060': [],
              'b3079c06-4ce1-4030-85a0-db79865a5e80': [
                {name: 'type', format: null},
                {name: 'name', format: null},
                {name: 'location', format: null},
                {name: 'capacity_mw', format: null},
                {name: 'year_opened', format: null}
              ]
            }
          },
          geocoder: {enabled: false},
          coordinate: {enabled: false}
        }
      }
    }
  };

  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});

  expect(
    map.layers.map(l => l.toString()),
    'layer names'
  ).toEqual([`HeatmapTileLayer({id: 'a6bbdbj'})`]);

  const heatmapTileLayer = map.layers[0] as HeatmapTileLayer;
  expect(heatmapTileLayer.props.id, 'heatmapTileLayer - id').toBe('a6bbdbj');
  expect(heatmapTileLayer.props.pickable, 'heatmapTileLayer - pickable').toBe(true);
  expect(heatmapTileLayer.props.visible, 'heatmapTileLayer - visible').toBe(true);
  expect(heatmapTileLayer.props.filled, 'heatmapTileLayer - filled').toBe(true);
  expect(heatmapTileLayer.props.stroked, 'heatmapTileLayer - stroked').toBe(false);
  expect(heatmapTileLayer.props.radiusPixels, 'heatmapTileLayer - radiusPixels').toBe(17.3);
  expect(heatmapTileLayer.props.colorRange, 'heatmapTileLayer - colorRange').toEqual([
    [255, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 255],
    [252, 141, 89, 255],
    [227, 74, 51, 255],
    [179, 0, 0, 255]
  ]);
  expect(typeof heatmapTileLayer.props.getWeight, 'heatmapTileLayer - getWeight').toBe('function');
  expect((heatmapTileLayer.props as any).cartoLabel, 'heatmapTileLayer - cartoLabel').toBe(
    'Layer 2'
  );
});

test('parseMap#unsupported layer type', () => {
  const json = {
    ...METADATA,
    datasets: DATASETS,
    keplerMapConfig: {
      version: 'v1',
      config: {
        visState: {
          layers: [
            {
              id: 'vlu4f7d',
              type: 'unsupported',
              config: {
                color: [18, 147, 154],
                label: 'Stores',
                dataId: 'DATA_ID',
                hidden: false,
                columns: {lat: 'latitude', lng: 'longitude', altitude: null},
                isVisible: true,
                textLabel: [],
                visConfig: {
                  filled: true,
                  radius: 20.2,
                  opacity: 0.42,
                  outline: true,
                  thickness: 4.5,
                  colorRange: {
                    name: 'Global Warming',
                    type: 'sequential',
                    colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                    category: 'Uber'
                  },
                  fixedRadius: false,
                  radiusRange: [0, 50],
                  strokeColor: [232, 250, 250],
                  strokeColorRange: {
                    name: 'Global Warming',
                    type: 'sequential',
                    colors: ['#5A1846', '#900C3F', '#C70039', '#E3611C', '#F1920E', '#FFC300'],
                    category: 'Uber'
                  }
                },
                highlightColor: [252, 242, 26, 255]
              },
              visualChannels: {
                sizeField: null,
                sizeScale: 'linear',
                colorField: null,
                colorScale: 'quantile',
                strokeColorField: {name: 'size_m2', type: 'integer'},
                strokeColorScale: 'quantile'
              }
            }
          ]
        }
      }
    }
  };
  const {layers} = parseMap(json);
  expect(layers).toEqual([undefined]);
});

// TODO test for no matching dataId
