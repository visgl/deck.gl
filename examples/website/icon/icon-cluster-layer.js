import {CompositeLayer, IconLayer, WebMercatorViewport} from 'deck.gl';
import rbush from 'rbush';

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

function getIconSize(size) {
  return Math.min(100, size) / 100 + 1;
}

export default class IconClusterLayer extends CompositeLayer {
  initializeState() {
    this.setState({
      // build spatial index
      tree: rbush(9, ['.x', '.y', '.x', '.y']),
      version: -1,
      z: -1,
      width: 0,
      height: 0
    });
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, oldProps, changeFlags}) {
    const {viewport} = this.context;

    const {width, height} = viewport;

    if (
      changeFlags.dataChanged ||
      props.sizeScale !== oldProps.sizeScale ||
      this.state.width !== width ||
      this.state.height !== height
    ) {
      const version = this._updateCluster(props, viewport);
      this.setState({version, width, height});
    }
    this.setState({
      z: Math.floor(viewport.zoom)
    });
  }

  renderLayers() {
    const {z, version} = this.state;
    const {data, iconAtlas, iconMapping, sizeScale, getPosition, onHover, onClick} = this.props;

    return new IconLayer(
      this.getSubLayerProps({
        id: 'icon',
        data,
        iconAtlas,
        iconMapping,
        sizeScale,
        getPosition,
        getIcon: d => d.zoomLevels[z] && d.zoomLevels[z].icon,
        getSize: d => d.zoomLevels[z] && d.zoomLevels[z].size,
        onHover,
        onClick,
        updateTriggers: {
          getIcon: {version, z},
          getSize: {version, z}
        }
      })
    );
  }

  // Compute icon clusters
  // We use the projected positions instead of longitude and latitude to build
  // the spatial index, because this particular dataset is distributed all over
  // the world, we can't use some fixed deltaLon and deltaLat
  _updateCluster({data, sizeScale}, viewport) {
    const {tree, version} = this.state;

    if (!data) {
      return version;
    }

    const transform = new WebMercatorViewport({
      ...viewport,
      zoom: 0
    });

    data.forEach(p => {
      const screenCoords = transform.project(p.coordinates);
      p.x = screenCoords[0];
      p.y = screenCoords[1];
      p.zoomLevels = [];
    });

    tree.clear();
    tree.load(data);

    for (let z = 0; z <= 20; z++) {
      const radius = sizeScale / Math.sqrt(2) / Math.pow(2, z);

      data.forEach(p => {
        if (p.zoomLevels[z] === undefined) {
          // this point does not belong to a cluster
          const {x, y} = p;

          // find all points within radius that do not belong to a cluster
          const neighbors = tree
            .search({
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
                size: getIconSize(neighbors.length),
                points: neighbors
              };
            } else {
              neighbor.zoomLevels[z] = null;
            }
          });
        }
      });
    }

    return version + 1;
  }
}
