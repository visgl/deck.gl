/* global window */
import React, {Component} from 'react';
import DeckGL, {IconLayer, WebMercatorViewport} from 'deck.gl';
import autobind from 'autobind-decorator';
import rbush from 'rbush';

import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';

const ICON_SIZE = 80;

function getIconName(size) {
  if (size === 0) {
    return '';
  }
  if (size < 10) {
    return `marker-${size}`;
  }
  if (size < 100) {
    return `marker-${Math.floor(size / 10)}0`;
  }
  return 'marker-100';
}

function stopPropagation(evt) {
  evt.stopPropagation();
}

export default class IconDemo extends Component {

  static get data() {
    return [
      {
        url: 'data/film-locations.txt',
        worker: 'workers/film-locations-decoder.js'
      },
      {
        url: 'images/location-icon-mapping.json'
      }
    ];
  }

  static get parameters() {
    return {
      cluster: {displayName: 'Cluster', type: 'checkbox', value: false}
    };
  }

  static get viewport() {
    return {
      mapStyle: MAPBOX_STYLES.DARK,
      longitude: -89.4,
      latitude: 36.7,
      zoom: 3,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Where Films Were Made (2007 - 2017)</h3>
        <p>Click a pin to expand detials.</p>
        <p>Data source: <a href="http://www.imdb.com/conditions">IMDB</a></p>
        <div className="layout">
          <div className="stat col-1-2">Movies
            <b>{ readableInteger(meta.movies || 0) }</b>
          </div>
          <div className="stat col-1-2">Locations
            <b>{ readableInteger(meta.locations || 0) }</b>
          </div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);

    // build spatial index
    this._tree = rbush(9, ['.x', '.y', '.x', '.y']);
    this.state = {
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const points = nextProps.data && nextProps.data[0];
    const oldPoints = this.props.data && this.props.data[0];
    const {viewport} = nextProps;
    const oldViewport = this.props.viewport;

    if (points && (
      points !== oldPoints ||
      viewport.width !== oldViewport.width ||
      viewport.height !== oldViewport.height)) {
      this._updateCluster(points, nextProps.viewport);
    }
  }

  // pre-compute icon clusters
  _updateCluster(points, viewport) {
    const tree = this._tree;

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    });

    points.forEach(p => {
      const screenCoords = transform.project(p.coordinates);
      p.x = screenCoords[0];
      p.y = screenCoords[1];
      p.zoomLevels = [];
    });

    tree.clear();
    tree.load(points);

    for (let z = 0; z <= 20; z++) {
      const radius = ICON_SIZE / window.devicePixelRatio / 2 / Math.pow(2, z);

      points.forEach(p => {
        if (p.zoomLevels[z] === undefined) {
          // this point does not belong to a cluster
          const {x, y} = p;

          // find all points within radius that do not belong to a cluster
          const neighbors = tree.search({
            minX: x - radius,
            minY: y - radius,
            maxX: x + radius,
            maxY: y + radius
          })
          .filter(neighbor => neighbor.zoomLevels[z] === undefined);

          // only show the center point at this zoom level
          neighbors.forEach(neighbor => {
            if (neighbor === p) {
              p.zoomLevels[z] = {
                icon: getIconName(neighbors.length),
                points: neighbors
              };
            } else {
              neighbor.zoomLevels[z] = null;
            }
          });
        }
      });
    }
  }

  @autobind _onHover({x, y, object}) {
    const {viewport, params} = this.props;
    const z = Math.floor(viewport.zoom);
    const showCluster = params.cluster.value;

    let hoveredItems = null;

    if (object) {
      hoveredItems = new Map();
      if (showCluster) {
        object.zoomLevels[z].points.forEach(p => {
          let scenes = hoveredItems.get(p.name);
          if (!scenes) {
            scenes = [];
            hoveredItems.set(p.name, scenes);
          }
          scenes.push(p.scene);
        });
      } else {
        hoveredItems.set(object.name, [object.scene]);
      }
      hoveredItems = hoveredItems.toJSON();
    }

    this.setState({x, y, hoveredItems, expanded: false});
  }

  @autobind _onClick() {
    this.setState({expanded: true});
  }

  _renderhoveredItems(z, showCluster) {
    const {x, y, hoveredItems, expanded} = this.state;

    if (!hoveredItems) {
      return null;
    }

    return (
      <div className={`tooltip ${expanded ? 'interactive' : ''}`}
           style={{left: x, top: y}}
           onWheel={stopPropagation}
           onMouseDown={stopPropagation}>
        {
          hoveredItems.map(([name, scenes]) => {
            return (
              <div key={name}>
                <h5>{name}</h5>
                { scenes.map((s, i) => <p key={i}>{s}</p>) }
              </div>
            );
          })
        }
      </div>
    );
  }

  render() {
    const {viewport, params, data} = this.props;
    const {hoveredItems} = this.state;

    if (!data || !data[0] || !data[1]) {
      return null;
    }

    const z = Math.floor(viewport.zoom);
    const showCluster = params.cluster.value;
    const size = showCluster ? 1 : Math.min(Math.pow(1.5, viewport.zoom - 10), 1);

    const layer = new IconLayer({
      id: 'icon',
      data: data[0],
      pickable: true,
      iconAtlas: 'images/location-icon-atlas.png',
      iconMapping: data[1],
      sizeScale: ICON_SIZE * size,
      getPosition: d => d.coordinates,
      getIcon: d => showCluster ? (d.zoomLevels[z] && d.zoomLevels[z].icon) : 'marker-1',
      getColor: d => [255, 180, 0, 160],
      getSize: d => 1,
      onHover: this._onHover,
      onClick: this._onClick,
      updateTriggers: {
        getIcon: {
          z: z * showCluster
        }
      }
    });

    return (
      <div className={`icon-demo ${hoveredItems ? 'clickable' : ''}`}>
        <DeckGL {...viewport} layers={ [layer] } />

        { this._renderhoveredItems(z, showCluster) }
      </div>
    );
  }
}
