import React, {Component} from 'react';
import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import App, {BANDS, LINES} from 'website-examples/contour/app';

import {makeExample} from '../components';

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

class ContourDemo extends Component {
  static title = 'COVID-19 Cases in the United States';

  static data = {
    url: `${DATA_URI}/covid-by-county.txt`,
    worker: '/workers/contour-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/examples/website/contour`;

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

  static mapStyle = MAPBOX_STYLES.DARK;

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

  componentDidMount() {
    this.updateSummary();
    this.updateOptions();
  }

  componentDidUpdate(oldProps) {
    if (this.props.params.week !== oldProps.params.week) {
      this.updateSummary();
    }
    if (this.props.data !== oldProps.data) {
      this.updateOptions();
    }
  }

  updateSummary() {
    const week = this.props.params.week.value;
    const date = new Date(Date.UTC(2020, 0, 20) + week * MS_PER_WEEK);

    this.props.onStateChange({
      date: `the week of ${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
    });
  }

  updateOptions() {
    const {data} = this.props;
    if (data) {
      let maxWeek = 0;
      for (const d of data) {
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

  render() {
    const {params, data} = this.props;
    const cellSize = params.cellSize.value;
    const week = params.week.value;
    const style = params.style.value;

    return (
      <App
        {...this.props}
        data={data}
        contours={style === 'Isoband' ? BANDS : LINES}
        cellSize={cellSize}
        week={week}
      />
    );
  }
}

export default makeExample(ContourDemo);
