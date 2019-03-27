"use strict";module.export({default:()=>ThirdPersonView});var View;module.link('./view',{default(v){View=v}},0);var Viewport;module.link('../viewports/viewport',{default(v){Viewport=v}},1);var Vector3,Matrix4,SphericalCoordinates;module.link('math.gl',{Vector3(v){Vector3=v},Matrix4(v){Matrix4=v},_SphericalCoordinates(v){SphericalCoordinates=v}},2);



function getDirectionFromBearingAndPitch({bearing, pitch}) {
  const spherical = new SphericalCoordinates({bearing, pitch});
  return spherical.toVector3().normalize();
}

class ThirdPersonView extends View {
  _getViewport(props) {
    const {bearing, pitch, position, up, zoom} = props.viewState;

    const direction = getDirectionFromBearingAndPitch({
      bearing,
      pitch
    });

    const distance = zoom * 50;

    // TODO somehow need to flip z to make it work
    // check if the position offset is done in the base viewport
    const eye = direction.scale(-distance).multiply(new Vector3(1, 1, -1));

    const viewMatrix = new Matrix4().multiplyRight(
      new Matrix4().lookAt({eye, center: position, up})
    );

    return new Viewport(
      Object.assign({}, props, {
        id: this.id,
        zoom: null, // triggers meter level zoom
        viewMatrix
      })
    );
  }
}

ThirdPersonView.displayName = 'ThirdPersonView';
