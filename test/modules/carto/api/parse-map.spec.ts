import test from 'tape-catch';
import {parseMap} from '@deck.gl/carto/api/parse-map';
import {GeoJsonLayer} from '@deck.gl/layers';
import {H3TileLayer, QuadbinTileLayer, VectorTileLayer, HeatmapTileLayer} from '@deck.gl/carto';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import {CPUGridLayer, HeatmapLayer, HexagonLayer} from '@deck.gl/aggregation-layers';

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

test('parseMap#invalid version', t => {
  const json = {
    ...METADATA,
    keplerMapConfig: {...EMPTY_KEPLER_MAP_CONFIG, version: 'invalid'}
  };
  t.throws(
    () => parseMap(json),
    /Only support Kepler v1/,
    'Throws on invalid Kepler schema version'
  );
  t.end();
});

test('parseMap#metadata', t => {
  const json = {
    ...METADATA,
    keplerMapConfig: EMPTY_KEPLER_MAP_CONFIG
  };
  const {layers, initialViewState, mapStyle, ...metadata} = parseMap(json);
  t.deepEquals(metadata, METADATA, 'Metadata is passed through');
  t.deepEquals(initialViewState, 'INITIAL_VIEW_STATE', 'Map state is passed through');
  t.deepEquals(mapStyle, 'MAP_STYLE', 'Map style is passed through');
  t.end();
});

test(`parseMap#visState empty`, async t => {
  const keplerMapConfig = {version: 'v1', config: {visState: {layers: []}}};
  const map = parseMap({...METADATA, datasets: DATASETS, keplerMapConfig});
  t.deepEquals(map.layers, [], 'layers empty');
  t.end();
});

test(`parseMap#visState point`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`GeoJsonLayer({id: 'ab2417x'})`],
    'layer names'
  );

  const layer = map.layers[0] as GeoJsonLayer;
  t.equal(layer.props.id, 'ab2417x', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.pointType, 'circle', 'pointType');
  t.deepEquals(layer.props.getFillColor, [18, 147, 154, 172], 'pointType');
  t.equal(layer.props.lineMiterLimit, 2, 'lineMiterLimit');
  t.equal((layer.props as any).cartoLabel, 'Stores', 'cartoLabel');
  t.end();
});

test(`parseMap#visState point + labels`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`GeoJsonLayer({id: 'vlu4f7d'})`],
    'layer names'
  );

  const layer = map.layers[0] as GeoJsonLayer;
  t.equal(layer.props.id, 'vlu4f7d', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.pointType, 'circle+text', 'pointType');
  t.deepEquals(layer.props.getFillColor, [18, 147, 154, 172], 'pointType');
  t.equal(layer.props.lineMiterLimit, 2, 'lineMiterLimit');
  t.equal((layer.props as any).cartoLabel, 'Stores', 'cartoLabel');
  t.end();
});

test(`parseMap#visState point + label + single marker`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`GeoJsonLayer({id: 'tyxi12'})`],
    'layer names'
  );

  const layer = map.layers[0] as GeoJsonLayer;
  t.equal(layer.props.id, 'tyxi12', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.pointType, 'icon+text', 'pointType');
  t.deepEquals(layer.props.getIconColor, [18, 147, 154], 'pointType');
  t.equal(layer.props.lineMiterLimit, 2, 'lineMiterLimit');
  t.equal((layer.props as any).cartoLabel, 'Stores', 'cartoLabel');
  t.end();
});

test(`parseMap#visState point + multi markers`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`GeoJsonLayer({id: 'baksj12'})`],
    'layer names'
  );

  const layer = map.layers[0] as GeoJsonLayer;
  t.equal(layer.props.id, 'baksj12', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.pointType, 'icon', 'pointType');
  t.deepEquals(layer.props.getIconColor, [18, 147, 154], 'pointType');
  t.equal((layer.props as any).cartoLabel, 'Stores', 'cartoLabel');
  t.end();
});

test(`parseMap#visState tileset point and line`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [
      `GeoJsonLayer({id: 'iim6w8'})`,
      `GeoJsonLayer({id: 'w04u776'})`,
      `VectorTileLayer({id: '87swuny'})`
    ],
    'layer names'
  );

  const circleLayer = map.layers[0] as GeoJsonLayer;
  t.equal(circleLayer.props.id, 'iim6w8', 'circleLayer - id');
  t.equal(circleLayer.props.pointType, 'circle', 'circleLayer - pointType');
  t.equal(circleLayer.props.filled, true, 'circleLayer - filled');
  t.equal(circleLayer.props.stroked, false, 'circleLayer - stroked');
  t.equal((circleLayer.props as any).cartoLabel, 'Layer 3', 'circleLayer - cartoLabel');

  const boundaryLayer = map.layers[1] as GeoJsonLayer;
  t.equal(boundaryLayer.props.id, 'w04u776', 'boundaryLayer - id');
  t.equal(boundaryLayer.props.filled, false, 'boundaryLayer - filled');
  t.equal(boundaryLayer.props.stroked, true, 'boundaryLayer - stroked');
  t.equal((boundaryLayer.props as any).cartoLabel, 'boundary', 'boundaryLayer - cartoLabel');

  const mvtLayer = map.layers[2] as VectorTileLayer;
  t.equal(mvtLayer.props.id, '87swuny', 'mvtLayer - id');
  t.equal(mvtLayer.props.uniqueIdProperty, 'geoid', 'mvtLayer - uniqueIdProperty');
  t.equal(mvtLayer.props.filled, true, 'mvtLayer - filled');
  t.equal(mvtLayer.props.stroked, true, 'mvtLayer - stroked');
  t.equal((mvtLayer.props as any).cartoLabel, 'transmission lines', 'mvtLayer - cartoLabel');

  t.end();
});

test(`parseMap#visState hexagon`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`H3HexagonLayer({id: 'jc4657'})`],
    'layer names'
  );

  const layer = map.layers[0] as H3HexagonLayer;
  t.equal(layer.props.id, 'jc4657', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.stroked, false, 'stroked');
  t.equal(layer.props.extruded, true, 'extruded');
  t.equal(layer.props.elevationScale, 70.1, 'elevationScale');
  t.equal((layer.props as any).cartoLabel, 'Population', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Polygon tileset`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`VectorTileLayer({id: '3btkipv'})`],
    'layer names'
  );

  const layer = map.layers[0] as VectorTileLayer;
  t.equal(layer.props.id, '3btkipv', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.filled, true, 'filled');
  t.equal(layer.props.stroked, false, 'stroked');
  t.equal(layer.props.extruded, false, 'extruded');
  t.equal(layer.props.uniqueIdProperty, 'geoid', 'elevationScale');
  t.deepEqual(layer.props.getLineColor, [221, 178, 124, 230], 'getLineColor');
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Polygon tileset geojson format`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`VectorTileLayer({id: 'kajdi11'})`],
    'layer names'
  );

  const layer = map.layers[0] as VectorTileLayer;
  t.equal(layer.props.id, 'kajdi11', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.filled, true, 'filled');
  t.equal(layer.props.stroked, false, 'stroked');
  t.equal(layer.props.extruded, false, 'extruded');
  t.equal(layer.props.uniqueIdProperty, 'geoid', 'elevationScale');
  t.deepEqual(layer.props.getLineColor, [221, 178, 124, 230], 'getLineColor');
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Polygon tileset binary format`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`VectorTileLayer({id: '91kajsh'})`],
    'layer names'
  );

  const layer = map.layers[0] as VectorTileLayer;
  t.equal(layer.props.id, '91kajsh', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.filled, true, 'filled');
  t.equal(layer.props.stroked, false, 'stroked');
  t.equal(layer.props.extruded, false, 'extruded');
  t.equal(layer.props.pointType, 'circle', 'pointType');
  t.equal(layer.props.uniqueIdProperty, 'geoid', 'elevationScale');
  t.deepEqual(layer.props.getLineColor, [221, 178, 124, 230], 'getLineColor');
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Grid layer`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`CPUGridLayer({id: 'ij06t3e'})`],
    'layer names'
  );

  const layer = map.layers[0] as CPUGridLayer;
  t.equal(layer.props.id, 'ij06t3e', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.elevationScale, 5, 'elevationScale');
  t.equal(layer.props.colorAggregation, 'SUM', 'colorAggregation');
  t.deepEqual(
    layer.props.colorRange,
    [
      [90, 24, 70, 255],
      [144, 12, 63, 255],
      [199, 0, 57, 255],
      [227, 97, 28, 255],
      [241, 146, 14, 255],
      [255, 195, 0, 255]
    ],
    'colorRange'
  );
  t.equal(layer.props.coverage, 1, 'coverage');
  t.equal(layer.props.elevationLowerPercentile, 0, 'elevationLowerPercentile');
  t.equal(layer.props.elevationUpperPercentile, 100, 'elevationUpperPercentile');
  t.equal(layer.props.cellSize, 500, 'cellSize');
  t.equal(layer.props.colorScaleType, 'quantile', 'colorScaleType');
  t.equal(layer.props.extruded, false, 'extruded');
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Hex Bin Layer`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`HexagonLayer({id: 'ja1357'})`],
    'layer names'
  );

  const layer = map.layers[0] as HexagonLayer<unknown>;
  t.equal(layer.props.id, 'ja1357', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.elevationScale, 5, 'elevationScale');
  t.equal(layer.props.colorAggregation, 'SUM', 'colorAggregation');
  t.deepEqual(
    layer.props.colorRange,
    [
      [255, 255, 204, 255],
      [217, 240, 163, 255],
      [173, 221, 142, 255],
      [120, 198, 121, 255],
      [49, 163, 84, 255],
      [0, 104, 55, 255]
    ],
    'colorRange'
  );
  t.equal(layer.props.coverage, 1, 'coverage');
  t.equal(layer.props.lowerPercentile, 0, 'elevationLowerPercentile');
  t.equal(layer.props.upperPercentile, 100, 'elevationUpperPercentile');
  t.equal(layer.props.elevationLowerPercentile, 0, 'elevationLowerPercentile');
  t.equal(layer.props.elevationUpperPercentile, 100, 'elevationUpperPercentile');
  t.equal(layer.props.radius, 300, 'cellSize');
  t.equal(layer.props.colorScaleType, 'quantile', 'colorScaleType');
  t.equal(layer.props.extruded, false, 'extruded');
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState Heatmap Layer`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`HeatmapLayer({id: 'fcpl61l'})`],
    'layer names'
  );

  const layer = map.layers[0] as HeatmapLayer<unknown>;
  t.equal(layer.props.id, 'fcpl61l', 'id');
  t.equal(layer.props.pickable, true, 'pickable');
  t.equal(layer.props.visible, true, 'visible');
  t.equal(layer.props.intensity, 1, 'intensity');
  t.equal(layer.props.radiusPixels, 21.7, 'radiusPixels');
  t.deepEqual(
    layer.props.colorRange,
    [
      [254, 240, 217, 255],
      [253, 212, 158, 255],
      [253, 187, 132, 255],
      [252, 141, 89, 255],
      [227, 74, 51, 255],
      [179, 0, 0, 255]
    ],
    'colorRange'
  );
  t.equal((layer.props as any).cartoLabel, 'Layer 1', 'cartoLabel');
  t.end();
});

test(`parseMap#visState tilesets spatial index`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`H3TileLayer({id: 'y64lw8'})`, `QuadbinTileLayer({id: 'a6bbdbj'})`],
    'layer names'
  );

  const h3Layer = map.layers[0] as H3TileLayer;
  t.equal(h3Layer.props.id, 'y64lw8', 'h3lLayer - id');
  t.equal(h3Layer.props.pickable, true, 'h3lLayer - pickable');
  t.equal(h3Layer.props.visible, true, 'h3lLayer - visible');
  t.equal(h3Layer.props.filled, true, 'h3lLayer - filled');
  t.equal(h3Layer.props.stroked, false, 'h3lLayer - stroked');
  t.equal((h3Layer.props as any).cartoLabel, 'Layer 1', 'h3lLayer - cartoLabel');

  const quadbinLayer = map.layers[1] as QuadbinTileLayer;
  t.equal(quadbinLayer.props.id, 'a6bbdbj', 'quadbinLayer - id');
  t.equal(quadbinLayer.props.pickable, true, 'quadbinLayer - pickable');
  t.equal(quadbinLayer.props.visible, true, 'quadbinLayer - visible');
  t.equal(quadbinLayer.props.filled, true, 'quadbinLayer - filled');
  t.equal(quadbinLayer.props.stroked, false, 'quadbinLayer - stroked');
  t.deepEqual(quadbinLayer.props.getFillColor, [246, 209, 138, 230], 'quadbinLayer - getFillColor');
  t.equal((quadbinLayer.props as any).cartoLabel, 'Layer 2', 'quadbinLayer - cartoLabel');
  t.end();
});

test(`parseMap#visState HeatmapTileLayer`, async t => {
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

  t.deepEquals(
    map.layers.map(l => l.toString()),
    [`HeatmapTileLayer({id: 'a6bbdbj'})`],
    'layer names'
  );

  const heatmapTileLayer = map.layers[0] as HeatmapTileLayer;
  t.equal(heatmapTileLayer.props.id, 'a6bbdbj', 'heatmapTileLayer - id');
  t.equal(heatmapTileLayer.props.pickable, true, 'heatmapTileLayer - pickable');
  t.equal(heatmapTileLayer.props.visible, true, 'heatmapTileLayer - visible');
  t.equal(heatmapTileLayer.props.filled, true, 'heatmapTileLayer - filled');
  t.equal(heatmapTileLayer.props.stroked, false, 'heatmapTileLayer - stroked');
  t.equal(heatmapTileLayer.props.radiusPixels, 17.3, 'heatmapTileLayer - radiusPixels');
  t.deepEqual(
    heatmapTileLayer.props.colorRange,
    [
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
      [252, 141, 89, 255],
      [227, 74, 51, 255],
      [179, 0, 0, 255]
    ],
    'heatmapTileLayer - colorRange'
  );
  t.equal(typeof heatmapTileLayer.props.getWeight, 'function', 'heatmapTileLayer - getWeight');
  t.equal((heatmapTileLayer.props as any).cartoLabel, 'Layer 2', 'heatmapTileLayer - cartoLabel');
  t.end();
});

test('parseMap#unsupported layer type', t => {
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
  t.deepEquals(layers, [undefined]);
  t.end();
});

// TODO test for no matching dataId
