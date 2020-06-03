import View from './view';
import GlobeViewport from '../viewports/globe-viewport';
import GlobeController from '../controllers/globe-controller';

export default class GlobeView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: GlobeViewport
      })
    );
  }

  get controller() {
    return this._getControllerProps({
      type: GlobeController,
      ViewportType: GlobeViewport
    });
  }
}

GlobeView.displayName = 'GlobeView';
