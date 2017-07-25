import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI} from '../../constants/defaults';
import {readableInteger} from '../../utils/format-utils';
import IconOverlay from '../../../../examples/icon/deckgl-overlay';

function stopPropagation(evt) {
  evt.stopPropagation();
}

export default class IconDemo extends Component {

  static get data() {
    return [
      {
        url: `${DATA_URI}/meteorites.txt`,
        worker: 'workers/meteorites-decoder.js'
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
      dragToRotate: false,
      mapStyle: MAPBOX_STYLES.DARK
    };
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Meteorites Landings</h3>
        <p>Data set from The Meteoritical Society showing information on all of
          the known meteorite landings.</p>
        <p>Hover on a pin to see the list of names</p>
        <p>Click on a pin to see the details</p>
        <p>Data source:
          <a href="https://data.nasa.gov/Space-Science/Meteorite-Landings/gh4g-9sfh">NASA</a>
        </p>
        <div className="layout">
          <div className="stat col-1-2">No. of Meteorites
            <b>{ readableInteger(meta.count || 0) }</b>
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
      if (showCluster) {
        hoveredItems = object.zoomLevels[z].points.sort((m1, m2) => m1.year - m2.year);
      } else {
        hoveredItems = [object];
      }
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

    if (expanded) {
      return (
        <div className="tooltip interactive"
             style={{left: x, top: y}}
             onWheel={stopPropagation}
             onMouseDown={stopPropagation}>
          {
            hoveredItems.map(({name, year, mass, class: meteorClass}) => {
              return (
                <div key={name}>
                  <h5>{name}</h5>
                  <div>Year: {year || 'unknown'}</div>
                  <div>Class: {meteorClass}</div>
                  <div>Mass: {mass}g</div>
                </div>
              );
            })
          }
        </div>
      );
    }

    return (
      <div className="tooltip" style={{left: x, top: y}} >
        { hoveredItems.slice(0, 20).map(({name, year}) =>
          <div key={name}><h5>{name} {year ? `(${year})` : ''}</h5></div>) }
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
