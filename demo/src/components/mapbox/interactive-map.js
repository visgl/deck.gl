import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';
import MapControls from './map-controls';

// InteractiveMap is for browser only and should work with isomorphic rendering
// Conditionally require mapbox only in browser to avoid issues under node.js
// Node apps can use StaticMap directly - requires adding additional dependencies
import {isBrowser} from './globals';
const StaticMap = isBrowser ? require('react-map-gl').StaticMap : null;

const propTypes = {
  displayConstraints: PropTypes.object.isRequired
};

const defaultProps = {
  displayConstraints: {
    maxPitch: 60
  }
};

export default class InteractiveMap extends PureComponent {
  constructor(props) {
    super(props);
  }

  // TODO - Remove once Viewport alternative is good enough
  _getMap() {
    return this._map._map;
  }

  // Checks a displayConstraints object to see if the map should be displayed
  checkDisplayConstraints(props) {
    const capitalize = s => s[0].toUpperCase() + s.slice(1);

    const {displayConstraints} = props;
    for (const propName in props) {
      const capitalizedPropName = capitalize(propName);
      const minPropName = `min${capitalizedPropName}`;
      const maxPropName = `max${capitalizedPropName}`;

      if (minPropName in displayConstraints && props[propName] < displayConstraints[minPropName]) {
        return false;
      }
      if (maxPropName in displayConstraints && props[propName] > displayConstraints[maxPropName]) {
        return false;
      }
    }
    return true;
  }

  render() {
    // Bail out under node
    if (!StaticMap) {
      return null;
    }

    const mapVisible = this.checkDisplayConstraints(this.props);
    const visibility = mapVisible ? 'visible' : 'hidden';

    return (
      createElement(MapControls, Object.assign({}, this.props, {
        key: 'map-controls',
        style: {position: 'relative'}
      }), [
        createElement(StaticMap, Object.assign({}, this.props, {
          key: 'map-static',
          style: {position: 'absolute', left: 0, top: 0, visibility},
          ref: map => {
            this._map = map;
          }
        })),
        createElement('div', {
          key: 'map-children',
          style: {position: 'absolute', left: 0, top: 0}
        },
          this.props.children
        )
      ])
    );
  }
}

InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
