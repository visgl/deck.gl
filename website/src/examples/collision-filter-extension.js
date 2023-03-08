import React, {Component} from 'react';
import {readableInteger} from '../utils/format-utils';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App, {COLORS_STEPS} from 'website-examples/collision-filter/app';

import {makeExample} from '../components';

class CollisionDemo extends Component {
  static title = 'California Collision Test';

  static code = `${GITHUB_TREE}/examples/website/collision-filter`;

  static parameters = {
    routeName: {
      displayName: 'Route',
      type: 'select',
      options: [
        'All routes',
        'US-101',
        'US-199',
        'US-395',
        'US-50',
        'US-6',
        'US-95',
        'US-97',
        'US-156',
        'I-5',
        'I-8',
        'US-170',
        'I-710',
        'I-210',
        'I-BR80',
        'I-10',
        'I-105',
        'I-110',
        'I-15',
        'I-205',
        'I-215',
        'I-238',
        'I-280',
        'I-380',
        'I-40',
        'I-405',
        'I-505',
        'I-580',
        'I-605',
        'I-680',
        'I-780',
        'I-80',
        'I-805',
        'I-880',
        'I-980'
      ],
      value: 'All routes'
    },
    sizeScale: {
      displayName: 'Label size scale',
      type: 'range',
      value: 5.3,
      step: 0.1,
      min: 1,
      max: 10
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>TEST COLLISION</p>
        {/* <div className="layout">
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
          Data source of Road Accidents:
          <a href="https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data">
            Data Gov UK
          </a>
          <br />
          Data source of City labels:{' '}
          <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a>
        </p> */}
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        sizeScale={params.sizeScale.value}
        routeName={params.routeName.value}
      />
    );
  }
}

export default makeExample(CollisionDemo);
