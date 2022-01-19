import LayersPass from './layers-pass';

export default class DrawLayersPass extends LayersPass {
  shouldDrawLayer(layer) {
    return layer.props.operation !== 'mask';
  }
}
