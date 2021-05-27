import Controller from './controller';
import {OrbitState} from './orbit-controller';

export default class OrthographicController extends Controller {
  constructor(props) {
    props.dragMode = props.dragMode || 'pan';
    super(OrbitState, props);
  }

  _onPanRotate(event) {
    // No rotation in orthographic view
    return false;
  }

  get linearTransitionProps() {
    return ['target', 'zoom'];
  }
}
