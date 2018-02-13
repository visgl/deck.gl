import View from './view';
import OrbitViewport from '../viewports/orbit-viewport';

export default class OrbitView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: OrbitViewport
      })
    );
  }
}

OrbitView.displayName = 'OrbitView';
