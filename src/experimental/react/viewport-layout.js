import React, {createElement, cloneElement} from 'react';

export default class ViewportLayout extends React.Component {

  constructor(props) {
    super(props);
  }

  // Iterate over viewport descriptors and render viewports at specified positions
  _renderViewportComponents() {
    const {viewports} = this.props;

    const children = [];

    viewports.forEach((viewportOrDescriptor, i) => {
      const {viewport, component, Component, props = {}} = viewportOrDescriptor;

      // Check if this is a descriptor with a component, otherwise ignore
      if (viewport && (component || Component)) {

        // TODO - this is too react-map-gl specific
        const newProps = Object.assign({}, props, {
          visible: viewport.isMapSynched(),
          width: viewport.width,
          height: viewport.height
        }, viewport.getMercatorParams());

        // Check if we should create or just modify a supplied React component
        const newComponent = component ?
          cloneElement(component, newProps) :
          createElement(Component, newProps);

        const style = {
          position: 'absolute',
          left: viewport.x,
          top: viewport.y,
          width: viewport.width,
          height: viewport.height
        };

        children.push(createElement('div', {key: `viewport-component-${i}`, style}, newComponent));
      }
    });

    return children;
  }

  render() {
    // Render the background elements (typically react-map-gl instances)
    // using the viewport descriptors
    const elements = this._renderViewportComponents();

    // Render the foreground elements, after (i.e. on top of) the background elements
    // This will typically be the DeckGL component
    const style = {position: 'absolute', left: 0, top: 0};
    elements.push(createElement('div', {key: 'children', style}, this.props.children));

    return createElement('div', {}, elements);
  }
}
