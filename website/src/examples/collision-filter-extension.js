import React, {Component} from 'react';
import {MAPBOX_STYLES, GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/collision-filter/app';

import {makeExample} from '../components';

class CollisionDemo extends Component {
  static title = 'Mexico principals roads';

  static code = `${GITHUB_TREE}/examples/website/collision-filter`;

  static parameters = {
    sizeScale: {
      displayName: 'Label spacing',
      type: 'range',
      value: 5,
      step: 1,
      min: 2,
      max: 10
    },
    collisionEnabled: {
      displayName: 'Avoid overlap',
      type: 'checkbox',
      value: true
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Principal roads from Mexico</p>
        <p>
          Data sources:
          <div>
            <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth </a>
          </div>
        </p>
      </div>
    );
  }

  render() {
    const {params, ...otherProps} = this.props;

    return (
      <App
        {...otherProps}
        sizeScale={params.sizeScale.value}
        collisionEnabled={params.collisionEnabled.value}
      />
    );
  }
}

export default makeExample(CollisionDemo);
