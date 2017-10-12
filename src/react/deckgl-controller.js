import {PureComponent, createElement} from 'react';
import DeckGLControllerJS from '../core/pure-js/deckgl-controller-js';

export default class DeckGLController extends PureComponent {

  constructor(props) {
    super(props);
    this.controller = null;
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;
    this.controller = new DeckGLControllerJS(Object.assign({}, this.props, {canvas: eventCanvas}));
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

    return (
      createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      },
        this.props.children
      )
    );
  }
}

DeckGLController.displayName = 'DeckGLController';
DeckGLController.propTypes = DeckGLControllerJS.propTypes;
DeckGLController.defaultProps = DeckGLControllerJS.defaultProps;
