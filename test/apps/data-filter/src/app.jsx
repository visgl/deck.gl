/* global window, document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL, {GeoJsonLayer, COORDINATE_SYSTEM} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';

import {DATA, COLORS, SHAPE_NAMES, SIZES} from './data-sample';

const dataFilterExtension = new DataFilterExtension({
  categorySize: 4,
  filterSize: 2,
  softMargin: true,
  countItems: true
});

const INITIAL_VIEW_STATE = {longitude: -122.45, latitude: 37.78, zoom: 12};

const LABELS = {};
for (const shape of Object.values(SHAPE_NAMES)) {
  LABELS[shape] = Math.random() < 0.3;
}
const ODDEVEN = {odd: true, even: true};

class Root extends Component {
  constructor(props) {
    super(props);

    this.state = {time: 1000, colors: COLORS, labels: LABELS, oddeven: ODDEVEN, sizes: SIZES};

    this._animate = this._animate.bind(this);
  }

  componentDidMount() {
    // this._animate();
  }

  _animate() {
    this.setState({time: Date.now()});
    window.requestAnimationFrame(this._animate);
  }

  _renderLayers() {
    const t = (this.state.time / 4000) % 1;
    const cos = Math.abs(Math.cos(t * Math.PI));
    const sin = Math.abs(Math.sin(t * Math.PI));

    const filterRange = [
      [-cos * 50000, cos * 50000], // x
      [-sin * 50000, sin * 50000] // y
    ];
    const filterSoftRange = [
      [-cos * 50000 + 10000, cos * 50000 - 10000], // x
      [-sin * 50000 + 10000, sin * 50000 - 10000] // y
    ];
    const filterCategoryList = [
      this.state.labels,
      this.state.oddeven,
      this.state.colors,
      this.state.sizes
    ].map(trueKeys);

    return [
      new GeoJsonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.45, 37.78],
        data: DATA,

        //stroked: false, // Works, but performance isn't great

        // Data accessors
        getFillColor: f => COLORS[f.properties.color],
        getLineWidth: 10,
        getPointRadius: f => SIZES[f.properties.size] * f.properties.radius,
        getFilterValue: f => f.properties.centroid,
        getFilterCategory: ({properties}) => [
          properties.label,
          properties.sides % 2 ? 'odd' : 'even',
          properties.color,
          properties.size
        ],
        // getFilterCategory: f => f.properties.label,

        // onFilteredItemsChange: console.log, // eslint-disable-line

        // Filter
        filterRange,
        filterSoftRange,
        // Filter by odd selected shape
        filterCategoryList,

        extensions: [dataFilterExtension]
      })
    ];
  }

  render() {
    return (
      <div>
        <DeckGL
          controller={true}
          initialViewState={INITIAL_VIEW_STATE}
          layers={this._renderLayers()}
        />
        <MultiSelect obj={LABELS} onChange={obj => this.setState({labels: obj})} />
        <MultiSelect obj={ODDEVEN} onChange={obj => this.setState({oddeven: obj})} />
        <MultiSelect obj={COLORS} onChange={obj => this.setState({colors: obj})} />
        <MultiSelect obj={SIZES} onChange={obj => this.setState({sizes: obj})} />
      </div>
    );
  }
}

function MultiSelect({obj, onChange}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        margin: 8,
        width: 110
      }}
    >
      {Object.entries(obj).map(([key, value]) => (
        <Checkbox
          key={key}
          label={key}
          value={value}
          onChange={e => {
            obj[key] = e.target.checked;
            onChange(obj);
          }}
        />
      ))}
    </div>
  );
}

function Checkbox({label, value, onChange}) {
  return (
    <label>
      {label}:
      <input type="checkbox" checked={value} onChange={onChange} />
      <br />
    </label>
  );
}

function trueKeys(obj) {
  return Object.entries(obj)
    .filter(([k, v]) => v)
    .map(([k, v]) => k);
}

const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
