// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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
  countItems: true
});

const INITIAL_VIEW_STATE = {longitude: 0, latitude: 0, zoom: 12};

const CONTROLS = {animate: false};
const LABELS = {};
for (const shape of Object.values(SHAPE_NAMES)) {
  LABELS[shape] = Math.random() < 0.3;
}
const ODDEVEN = {odd: true, even: true};

const boxStyle = {
  position: 'relative' as const,
  background: 'rgba(255, 255, 255, 0.9)',
  padding: 10,
  margin: 8,
  width: 110
};

type RootState = {
  counts: Record<string, number>;
  time: number;
  controls: Record<string, boolean>;
  colors: Record<string, number[]>;
  labels: Record<string, boolean>;
  oddeven: Record<string, boolean>;
  sizes: Record<string, number>;
};

class Root extends Component<any, RootState> {
  constructor(props) {
    super(props);

    this.state = {
      counts: {},
      time: 1000,
      controls: CONTROLS,
      colors: COLORS,
      labels: LABELS,
      oddeven: ODDEVEN,
      sizes: SIZES
    };

    this._animate = this._animate.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  _animate() {
    if (this.state.controls.animate) {
      this.setState({time: Date.now()});
      window.requestAnimationFrame(this._animate);
    }
  }

  _renderLayers() {
    const t = (this.state.time / 4000) % 1;
    const cos = Math.abs(Math.cos(t * Math.PI));
    const sin = Math.abs(Math.sin(t * Math.PI));

    const filterRange = [
      [-cos * 5000, cos * 5000], // x
      [-sin * 5000, sin * 5000] // y
    ];
    const filterSoftRange = [
      [-cos * 5000 + 1000, cos * 5000 - 1000], // x
      [-sin * 5000 + 1000, sin * 5000 - 1000] // y
    ];
    window.requestAnimationFrame(this._animate);

    const {labels, oddeven, colors, sizes} = this.state;
    const filterCategories = [labels, oddeven, colors, sizes].map(trueKeys);

    return [
      new GeoJsonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        data: DATA,

        // Data accessors
        getFillColor: f => COLORS[f.properties!.color],
        getLineWidth: 10,
        getPointRadius: f => SIZES[f.properties!.size] * f.properties!.radius,
        getFilterValue: f => f.properties.centroid,
        getFilterCategory: ({properties}) => [
          properties.label,
          properties.sides % 2 ? 'odd' : 'even',
          properties.color,
          properties.size
        ],

        onFilteredItemsChange: e => {
          const {counts} = this.state;
          if (counts[e.id] !== e.count && !e.id.includes('stroke')) {
            counts[e.id] = e.count;
            this.setState({counts});
          }
        },

        // Filter
        filterRange,
        filterSoftRange,
        filterCategories,

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
        <MultiSelect obj={CONTROLS} onChange={obj => this.setState({controls: obj})} />
        <MultiSelect obj={LABELS} onChange={obj => this.setState({labels: obj})} />
        <MultiSelect obj={ODDEVEN} onChange={obj => this.setState({oddeven: obj})} />
        <MultiSelect obj={COLORS} onChange={obj => this.setState({colors: obj})} />
        <MultiSelect obj={SIZES} onChange={obj => this.setState({sizes: obj})} />
        <div style={boxStyle}>
          Count {Object.values(this.state.counts).reduce((a, b) => a + b, 0)}
        </div>
      </div>
    );
  }
}

function MultiSelect({obj, onChange}) {
  return (
    <div style={boxStyle}>
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
