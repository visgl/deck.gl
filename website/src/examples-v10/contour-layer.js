// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {BANDS, LINES} from 'v10-website-examples/contour/app';

import {makeExample} from '../components';

/** Provides ms per week for the example. */
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

/** Connects the Arrow contour example to the website controls. */
class ContourDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'COVID-19 Cases in the United States';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/contour`;

  /** Interactive controls and their initial values. */
  static parameters = {
    style: {
      displayName: 'Style',
      type: 'select',
      options: ['Isoband', 'Isoline'],
      value: 'Isoband'
    },
    cellSize: {
      displayName: 'Cell size',
      type: 'range',
      value: 60000,
      step: 5000,
      min: 30000,
      max: 100000
    },
    week: {displayName: 'Week', type: 'range', value: 30, step: 1, min: 0, max: 86}
  };

  /** Base map style used by the demo. */
  static mapStyle = MAPBOX_STYLES.DARK;

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    return (
      <div>
        <p>
          Reported new COVID-19 cases per 100,000 residents{' '}
          {meta.date ? `during ${meta.date}` : null}
        </p>
        <div className="layout">
          {LINES.map((c, i) => (
            <div
              className="legend"
              key={i}
              style={{
                background: `rgb(${c.color.join(',')})`,
                width: `${100 / LINES.length}%`
              }}
            />
          ))}
        </div>
        <p className="layout">
          {LINES.map((c, i) => (
            <div key={i} className="text-right" style={{width: `${100 / LINES.length}%`}}>
              {i < LINES.length - 1 ? c.threshold : ''}
            </div>
          ))}
        </p>
        <p>
          Data source: <a href="https://github.com/nytimes/covid-19-data">New York Times </a>
        </p>
      </div>
    );
  }

  /** Initializes the demo after its container mounts. */
  componentDidMount() {
    this.updateSummary();
  }

  /** Updates the demo when its inputs change. */
  componentDidUpdate(oldProps) {
    if (this.props.params.week !== oldProps.params.week) {
      this.updateSummary();
    }
  }

  /** Updates the summary for the selected time period. */
  updateSummary() {
    /** Provides week for the example. */
    const week = this.props.params.week.value;
    /** Provides date for the example. */
    const date = new Date(Date.UTC(2020, 0, 20) + week * MS_PER_WEEK);

    this.props.onStateChange({
      date: `the week of ${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
    });
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params} = this.props;
    /** Provides cell size for the example. */
    const cellSize = params.cellSize.value;
    /** Provides week for the example. */
    const week = params.week.value;
    /** Provides style for the example. */
    const style = params.style.value;

    return (
      <App
        mapStyle={this.props.mapStyle}
        device={this.props.device}
        key={this.props.device?.type}
        contours={style === 'Isoband' ? BANDS : LINES}
        cellSize={cellSize}
        week={week}
      />
    );
  }
}

export default makeExample(ContourDemo);
