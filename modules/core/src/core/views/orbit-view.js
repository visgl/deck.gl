import View from './view';
import OrbitViewport from '../viewports/orbit-viewport';

export default class OrbitView extends View {
  // Get camera `distance` to make view fit a box centered at lookat position in the viewport.
  // @param {Array} boundingBox - [sizeX, sizeY, sizeZ]], defines the dimensions of bounding box
  static getDistance({boundingBox, fov}) {
    const halfMaxSide = Math.max(boundingBox[0], boundingBox[1], boundingBox[2]) / 2;
    const distance = halfMaxSide / Math.tan(fov / 180 * Math.PI / 2);
    return distance;
  }

  constructor(props) {
    super(
      Object.assign({}, props, {
        type: OrbitViewport
      })
    );
  }
}

OrbitView.displayName = 'OrbitView';
