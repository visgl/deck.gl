import Controller from './controller';
import {OrbitState} from './orbit-controller';

export default class OrthographicController extends Controller {
  constructor(props) {
    super(OrbitState, props);
    this.invertPan = true;
  }

  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }
    return this._onPanRotateMap(event);
  }
}
