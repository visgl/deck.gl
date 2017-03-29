import React, {Component} from 'react';
import {MAPBOX_STYLES} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import IconOverlay from '../../../../examples/icon/deckgl-overlay';

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
      cluster: {displayName: 'Cluster', type: 'checkbox', value: true}
    };
  }

  static get viewport() {
    return {
      ...IconOverlay.defaultViewport,
      mapStyle: MAPBOX_STYLES.DARK
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

    this.state = {
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    };
  }

  _onHover({x, y, object}) {
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

  _onClick() {
    this.setState({expanded: true});
  }

  _renderhoveredItems() {
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

    if (!data) {
      return null;
    }

    return (
      <div className={`icon-demo ${hoveredItems ? 'clickable' : ''}`}>
        <IconOverlay viewport={viewport}
          data={data[0]}
          iconAtlas="images/location-icon-atlas.png"
          iconMapping={data[1]}
          showCluster={params.cluster.value}
          onHover={this._onHover.bind(this)}
          onClick={this._onClick.bind(this)} />

        { this._renderhoveredItems() }
      </div>
    );
  }
}
