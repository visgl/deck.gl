// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {BANDS, LINES} from 'arrow-website-examples/contour/app';

import {makeExample} from '../components';

/** Provides ms per week for the example. */
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

/** Connects the Arrow contour example to the website controls. */
class ContourDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'COVID-19 Cases in the United States';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Data sources loaded before rendering the demo. */
  static data = {
    url: `${DATA_URI}/covid-by-county.txt`,
    worker: '/workers/contour-data-decoder.js'
  };

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-arrow/website/contour`;

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
    week: {displayName: 'Week', type: 'range', value: 30, step: 1, min: 0, max: 30}
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
    this.updateOptions();
  }

  /** Updates the demo when its inputs change. */
  componentDidUpdate(oldProps) {
    if (this.props.params.week !== oldProps.params.week) {
      this.updateSummary();
    }
    if (this.props.data !== oldProps.data) {
      this.updateOptions();
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

  /** Updates the available controls from the loaded data. */
  updateOptions() {
    /** Provides data for the example. */
    const {data} = this.props;
    if (data) {
      /** Provides max week for the example. */
      let maxWeek = 0;
      for (const d of data) {
        /** Provides weeks for the example. */
        const weeks = Object.keys(d.casesByWeek)
          .map(Number)
          .sort((a, b) => a - b);
        maxWeek = Math.max(maxWeek, weeks.pop());
      }
      this.props.useParam({
        ...ContourDemo.parameters,
        week: {...ContourDemo.parameters.week, max: maxWeek}
      });
    }
  }

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    /** Provides params, data for the example. */
    const {params, data} = this.props;
    /** Provides cell size for the example. */
    const cellSize = params.cellSize.value;
    /** Provides week for the example. */
    const week = params.week.value;
    /** Provides style for the example. */
    const style = params.style.value;

    return (
      <App
        {...this.props}
        key={this.props.device?.type}
        data={data}
        contours={style === 'Isoband' ? BANDS : LINES}
        cellSize={cellSize}
        week={week}
      />
    );
  }
}

export default makeExample(ContourDemo);
