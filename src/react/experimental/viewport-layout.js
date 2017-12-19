import React, {createElement, cloneElement} from 'react';
import {flatten} from '../../core/utils/flatten';

export default class ViewportLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  // Iterate over viewport descriptors and render viewports at specified positions
  _renderChildrenUnderViewports() {
    // Flatten out nested viewports array
    const viewports = flatten(this.props.viewports, {filter: Boolean});

    // Build a viewport id to viewport index
    const viewportMap = {};
    viewports.forEach(viewportOrDescriptor => {
      const viewport = viewportOrDescriptor.viewport || viewportOrDescriptor;
      if (viewport.id) {
        viewportMap[viewport.id] = viewport;
      }
    });

    const originalChildren = React.Children.toArray(this.props.children);
    const lastElement = originalChildren.pop();

    const children = originalChildren.map((child, i) => {
      // If viewportId is provided, match with viewport
      if (child.props.viewportId) {
        const viewport = viewportMap[child.props.viewportId];

        // TODO - this is too react-map-gl specific
        const newProps = Object.assign(
          {},
          child.props,
          {
            visible: viewport.isMapSynched(),
            width: viewport.width,
            height: viewport.height
          },
          viewport.getMercatorParams()
        );

        const clone = cloneElement(child, newProps);

        const style = {
          position: 'absolute',
          left: viewport.x,
          top: viewport.y,
          width: viewport.width,
          height: viewport.height
        };

        child = createElement('div', {key: `viewport-component-${i}`, style}, clone);
      }

      return child;
    });

    const style = {position: 'absolute', left: 0, top: 0};
    children.push(createElement('div', {key: 'children', style}, lastElement));

    return children;
  }

  render() {
    // Render the background elements (typically react-map-gl instances)
    // using the viewport descriptors
    const children = this._renderChildrenUnderViewports();
    return createElement('div', {}, children);
  }
}
