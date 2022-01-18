import {Vector3, Matrix4} from '@math.gl/core';
import {pixelsToWorld} from '@math.gl/web-mercator';
import {
  COORDINATE_SYSTEM,
  PROJECTION_MODE,
  getUniformsFromViewport,
  WebMercatorViewport
} from '@deck.gl/core';

const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];

/*
 * Compute orthographic projection that converts shader common space coordinates into mask clipspace
 */
export function getMaskProjectionMatrix({width, height, pixelUnprojectionMatrix}) {
  // Unproject corners of viewport into common space (these correspond to the edges
  // of the framebuffer we are rendering into)
  const [[left, top], [right, bottom]] = [
    [0, 0],
    [width, height]
  ].map(pixel => pixelsToWorld(pixel, pixelUnprojectionMatrix));

  // Construct orthographic projection that will map common space positions into clipspace
  const near = 0.1;
  const far = 1000;
  return new Matrix4().ortho({left, top, right, bottom, near, far});
}

/*
 * Compute viewport to render the mask into, such that it covers an
 * area currently visible (extended by a buffer) or the area of the masking
 * data, whichever is smaller
 */
export function getMaskViewport(positions, layerViewport, {width, height}) {
  const bounds = layerViewport.getBounds();
  let viewport = new WebMercatorViewport({width, height}).fitBounds([
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]]
  ]);
  const {longitude, latitude, zoom} = viewport;
  viewport = new WebMercatorViewport({width, height, longitude, latitude, zoom: zoom - 1});

  const dataBounds = getBounds(positions);
  const dataViewport = new WebMercatorViewport({width, height}).fitBounds(dataBounds, {
    padding: 2
  });

  return dataViewport.zoom > viewport.zoom ? dataViewport : viewport;
}

/*
 * Splits the projection matrix into a centered matrix and a center offset.
 * This ensures the correct transformation is used when the `WEB_MERCATOR_AUTO_OFFSET`
 * projection mode is used at higher zoom levels
 */
export function splitMaskProjectionMatrix(
  projectionMatrix,
  viewport,
  {coordinateSystem, coordinateOrigin, modelMatrix}
) {
  const {project_uCenter, project_uCoordinateSystem, project_uProjectionMode} =
    getUniformsFromViewport({
      viewport,
      modelMatrix,
      coordinateSystem,
      coordinateOrigin
    });

  // Obtain center relative to which coordinates will be drawn (in common space)
  const center = project_uCenter;
  const projectionMatrixCentered = projectionMatrix.clone().translate(new Vector3(center).negate());

  let maskProjectionMatrix = projectionMatrix;
  let maskProjectCenter = new Matrix4(viewport.viewProjectionMatrix).invert().transform(center);

  if (
    project_uCoordinateSystem === COORDINATE_SYSTEM.LNGLAT &&
    project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR
  ) {
    maskProjectionMatrix = projectionMatrixCentered;
  }

  if (project_uProjectionMode === PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET) {
    maskProjectionMatrix = maskProjectionMatrix.clone().multiplyRight(VECTOR_TO_POINT_MATRIX);
    maskProjectCenter = projectionMatrixCentered.transform(maskProjectCenter);

    // Translation needed to avoid shift in shader. TODO: unclear why this is
    // needed, the shadow effect doesn't do this
    const t = new Matrix4();
    t.translate(center);
    maskProjectionMatrix.multiplyRight(t);
  }

  return {maskProjectionMatrix, maskProjectCenter};
}

function getBounds({startIndices, size, value}) {
  const bounds = [
    [Infinity, Infinity],
    [-Infinity, -Infinity]
  ];

  const start = startIndices[0];
  const end = startIndices[startIndices.length - 1];
  for (let i = start; i < end; i++) {
    const coord = value.subarray(size * i);
    if (bounds[0][0] > coord[0]) {
      bounds[0][0] = coord[0];
    }
    if (bounds[0][1] > coord[1]) {
      bounds[0][1] = coord[1];
    }
    if (bounds[1][0] < coord[0]) {
      bounds[1][0] = coord[0];
    }
    if (bounds[1][1] < coord[1]) {
      bounds[1][1] = coord[1];
    }
  }

  if (bounds[0][0] === Infinity) {
    return [
      [0, 0],
      [1, 1]
    ];
  }
  return bounds;
}
