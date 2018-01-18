import {PureComponent, createElement} from 'react';
import {experimental} from '../core';
const {OrbitControllerJS, OrbitViewport} = experimental;

export default class OrbitController extends PureComponent {
  // Returns a deck.gl Viewport instance, to be used with the DeckGL component
  static getViewport(viewport) {
    return new OrbitViewport(viewport);
  }

  constructor(props) {
    super(props);
    this.controller = null;
  }

  componentDidMount() {
    this.controller = new OrbitControllerJS(
      Object.assign({}, this.props, {canvas: this.eventCanvas})
    );
  }

  componentWillUpdate(nextProps) {
    this.controller.setProps(nextProps);
  }

  componentWillUnmount() {
    this.controller.finalize();
  }

  render() {
    const {width, height} = this.props;

    const eventCanvasStyle = {
      width,
      height,
      position: 'relative'
    };

    return createElement(
      'div',
      {
        key: 'map-controls',
        ref: c => (this.eventCanvas = c),
        style: eventCanvasStyle
      },
      this.props.children
    );
  }
}

OrbitController.displayName = 'OrbitController';
OrbitController.propTypes = OrbitControllerJS.propTypes;
OrbitController.defaultProps = OrbitControllerJS.defaultProps;
