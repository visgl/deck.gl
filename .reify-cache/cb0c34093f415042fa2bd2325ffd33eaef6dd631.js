"use strict";module.export({default:()=>FirstPersonView});var View;module.link('./view',{default(v){View=v}},0);var Viewport;module.link('../viewports/viewport',{default(v){Viewport=v}},1);var Matrix4,SphericalCoordinates;module.link('math.gl',{Matrix4(v){Matrix4=v},_SphericalCoordinates(v){SphericalCoordinates=v}},2);var FirstPersonController;module.link('../controllers/first-person-controller',{default(v){FirstPersonController=v}},3);




function getDirectionFromBearingAndPitch({bearing, pitch}) {
  const spherical = new SphericalCoordinates({bearing, pitch});
  const direction = spherical.toVector3().normalize();
  return direction;
}

class FirstPersonView extends View {
  get controller() {
    return this._getControllerProps({
      type: FirstPersonController
    });
  }

  _getViewport(props) {
    // TODO - push direction handling into Matrix4.lookAt
    const {
      // view matrix arguments
      modelMatrix = null,
      bearing,
      up = [0, 0, 1] // Defines up direction, default positive z axis,
    } = props.viewState;

    // Always calculate direction from bearing and pitch
    const dir = getDirectionFromBearingAndPitch({
      bearing,
      pitch: 89
    });

    // Direction is relative to model coordinates, of course
    const center = modelMatrix ? modelMatrix.transformDirection(dir) : dir;

    // Just the direction. All the positioning is done in viewport.js
    const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 0], center, up});

    return new Viewport(
      Object.assign({}, props, {
        zoom: null, // triggers meter level zoom
        viewMatrix
      })
    );
  }
}

FirstPersonView.displayName = 'FirstPersonView';
