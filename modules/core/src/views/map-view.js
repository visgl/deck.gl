import View from './view';
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import MapController from '../controllers/map-controller';

export default class MapView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: WebMercatorViewport
      })
    );
  }
}

MapView.displayName = 'MapView';

MapView.defaultController = {
  type: MapController
};
