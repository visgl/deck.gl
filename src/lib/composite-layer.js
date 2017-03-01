import Layer from './layer';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  getPickingInfo(opts) {
    // do not call onHover/onClick on the container
    return null;
  }
}
