import {PureComponent, createElement} from 'react';
import MapControllerJS from '../core/pure-js/map-controller';

export default class MapController extends PureComponent {

  constructor(props) {
    super(props);
    this.controller = null;
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;
    this.controller = new MapControllerJS(Object.assign({}, this.props, {canvas: eventCanvas}));
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

MapController.displayName = 'MapController';
MapController.propTypes = MapControllerJS.propTypes;
MapController.defaultProps = MapControllerJS.defaultProps;
