import {PathLayer} from 'deck.gl';

// PathLayer subclass by @dcposch
export default class MultiColorPathLayer extends PathLayer {
  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths, pointCount} = this.state;
    const {size} = attribute;
    const colors = new Uint8ClampedArray(pointCount * size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const color = getColor(data[index], index);
      if (Array.isArray(color[0])) {
        if (color.length !== path.length) {
          throw new Error(`PathLayer getColor() returned a color array, but the number of \
colors returned doesn't match the number of points in the path. Index ${index}`);
        }
        color.forEach(pointColor => {
          const alpha = isNaN(pointColor[3]) ? 255 : pointColor[3];
          // two copies for outside edge and inside edge each
          colors[i++] = pointColor[0];
          colors[i++] = pointColor[1];
          colors[i++] = pointColor[2];
          colors[i++] = alpha;
          colors[i++] = pointColor[0];
          colors[i++] = pointColor[1];
          colors[i++] = pointColor[2];
          colors[i++] = alpha;
        });
      } else {
        const pointColor = color;
        if (isNaN(pointColor[3])) {
          pointColor[3] = 255;
        }
        for (let ptIndex = 0; ptIndex < path.length; ptIndex++) {
          // two copies for outside edge and inside edge each
          colors[i++] = pointColor[0];
          colors[i++] = pointColor[1];
          colors[i++] = pointColor[2];
          colors[i++] = pointColor[3];
          colors[i++] = pointColor[0];
          colors[i++] = pointColor[1];
          colors[i++] = pointColor[2];
          colors[i++] = pointColor[3];
        }
      }
    });
    attribute.value = colors;
  }
}

MultiColorPathLayer.layerName = 'MultiColorPathLayer';
