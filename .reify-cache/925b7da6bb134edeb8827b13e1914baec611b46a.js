"use strict";module.export({default:()=>MapView});var View;module.link('./view',{default(v){View=v}},0);var WebMercatorViewport;module.link('../viewports/web-mercator-viewport',{default(v){WebMercatorViewport=v}},1);var MapController;module.link('../controllers/map-controller',{default(v){MapController=v}},2);



class MapView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: WebMercatorViewport
      })
    );
  }

  get controller() {
    return this._getControllerProps({
      type: MapController
    });
  }
}

MapView.displayName = 'MapView';
