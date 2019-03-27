"use strict";module.export({default:()=>PerspectiveView});var View;module.link('./view',{default(v){View=v}},0);var Viewport;module.link('../viewports/viewport',{default(v){Viewport=v}},1);var mat4;module.link('gl-matrix/mat4',{"*"(v){mat4=v}},2);




const DEGREES_TO_RADIANS = Math.PI / 180;

class PerspectiveView extends View {
  _getViewport(props) {
    const {
      // viewport arguments
      x,
      y,
      width, // Width of viewport
      height, // Height of viewport

      viewState
    } = props;

    const {
      // view matrix arguments
      eye, // Defines eye position
      lookAt = [0, 0, 0], // Which point is camera looking at, default origin
      up = [0, 1, 0] // Defines up direction, default positive y axis
    } = viewState;

    // Projection matrix arguments
    // TODO - Extracting from viewState is deprecated
    const fovy = props.fovy || viewState.fovy || 75; // Field of view covered by camera
    const near = props.near || viewState.near || 1; // Distance of near clipping plane
    const far = props.far || viewState.far || 100; // Distance of far clipping plane
    const aspect = Number.isFinite(viewState.aspect) ? viewState.aspect : width / height;

    const fovyRadians = fovy * DEGREES_TO_RADIANS;
    return new Viewport({
      id: this.id,
      x,
      y,
      width,
      height,
      viewMatrix: mat4.lookAt([], eye, lookAt, up),
      projectionMatrix: mat4.perspective([], fovyRadians, aspect, near, far)
    });
  }
}

PerspectiveView.displayName = 'PerspectiveView';
