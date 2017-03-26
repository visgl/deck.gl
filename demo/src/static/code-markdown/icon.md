```
/* global window */
import React, {Component} from 'react';
import DeckGL, {IconLayer, WebMercatorViewport} from 'deck.gl';
import autobind from 'autobind-decorator';
import rbush from 'rbush';

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

export default class IconDemo extends Component {

  constructor(props) {
    super(props);

    // build spatial index
    this._tree = rbush(9, ['.x', '.y', '.x', '.y']);
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

  render() {
    const {viewport, params, data, iconMapping} = this.props;

    if (!data || !iconMapping) {
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
      iconMapping,
      sizeScale: ICON_SIZE * size,
      getPosition: d => d.coordinates,
      getIcon: d => showCluster ? (d.zoomLevels[z] && d.zoomLevels[z].icon) : 'marker-1',
      getColor: d => [255, 180, 0, 160],
      getSize: d => 1,
      updateTriggers: {
        getIcon: {
          z: z * showCluster
        }
      }
    });

    return <DeckGL {...viewport} layers={ [layer] } />;
  }
}

```
