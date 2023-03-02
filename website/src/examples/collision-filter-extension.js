import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLORS_STEPS} from 'website-examples/collision-filter/app';

import {makeExample} from '../components';

class CollisionDemo extends Component {
  static title = 'UK Road accidents by severity, 2021';

  static code = `${GITHUB_TREE}/examples/website/collision-filter`;

  static parameters = {
    radiusScale: {
      displayName: 'Accident radius scale',
      type: 'range',
      value: 1.5,
      step: 0.01,
      min: 1,
      max: 2
    },
    priorityDesc: {
      displayName: 'Order by severity',
      type: 'select',
      options: ['High', 'Low'],
      value: 'High'
    },
    sizeScale: {
      displayName: 'Label size scale',
      type: 'range',
      value: 5.3,
      step: 0.1,
      min: 1,
      max: 10
    },
    priorityLabelDesc: {
      displayName: 'Order by city rank',
      type: 'select',
      options: ['Max', 'Min'],
      value: 'Max'
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Severity</p>
        <div className="layout">
          {COLORS_STEPS.map((c, i) => (
            <div
              className="legend"
              key={i}
              style={{
                background: `rgb(${c.color.join(',')})`,
                width: `${100 / COLORS_STEPS.length}%`
              }}
            />
          ))}
        </div>
        <p className="layout">
          {COLORS_STEPS.map((c, i) => (
            <div key={i} className="text-center" style={{width: `${100 / COLORS_STEPS.length}%`}}>
              {c.threshold}
            </div>
          ))}
        </p>
        <div className="stat">
          No. of accidents<b>{readableInteger(101070)}</b>
        </div>
        <p>
          Data source of Road Accidents 2021:
          <a href="https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data">
            Uk government
          </a>
          <br />
          Data source of City labels: <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a>
        </p>
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        radiusScale={params.radiusScale.value}
        priorityDesc={params.priorityDesc.value}
        sizeScale={params.sizeScale.value}
        priorityLabelDesc={params.priorityLabelDesc.value}
      />
    );
  }
}

export default makeExample(CollisionDemo);
