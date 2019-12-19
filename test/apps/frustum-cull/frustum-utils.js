import {Vector3} from 'math.gl';
import * as mat3 from 'gl-matrix/mat3';

const NEAR = [255, 0, 128];
const FAR = [128, 0, 255];
const MID = [0, 128, 255];

const scratchPosition = new Vector3();

export function getCulling(viewport, point) {
  // Culling tests must be done in common space
  const commonPosition = viewport.projectPosition(point);

  // Extract frustum planes based on current view.
  const frustumPlanes = viewport.getFrustumPlanes();
  let outDir = null;
  for (const dir in frustumPlanes) {
    const plane = frustumPlanes[dir];

    if (scratchPosition.copy(commonPosition).dot(plane.normal) > plane.distance) {
      outDir = dir;
      break;
    }
  }

  return outDir;
}

export function getFrustumBounds(viewport) {
  const planes = viewport.getFrustumPlanes();

  const ntl = viewport.unprojectPosition(getIntersection(planes.near, planes.top, planes.left));
  const ntr = viewport.unprojectPosition(getIntersection(planes.near, planes.top, planes.right));
  const nbl = viewport.unprojectPosition(getIntersection(planes.near, planes.bottom, planes.left));
  const nbr = viewport.unprojectPosition(getIntersection(planes.near, planes.bottom, planes.right));
  const ftl = viewport.unprojectPosition(getIntersection(planes.far, planes.top, planes.left));
  const ftr = viewport.unprojectPosition(getIntersection(planes.far, planes.top, planes.right));
  const fbl = viewport.unprojectPosition(getIntersection(planes.far, planes.bottom, planes.left));
  const fbr = viewport.unprojectPosition(getIntersection(planes.far, planes.bottom, planes.right));

  return [
    {source: ntl, target: ntr, color: NEAR}, // near top
    {source: ntr, target: nbr, color: NEAR}, // near right
    {source: nbr, target: nbl, color: NEAR}, // near bottom
    {source: nbl, target: ntl, color: NEAR}, // near left
    {source: ftl, target: ftr, color: FAR}, // far top
    {source: ftr, target: fbr, color: FAR}, // far right
    {source: fbr, target: fbl, color: FAR}, // far bottom
    {source: fbl, target: ftl, color: FAR}, // far left
    {source: ntl, target: ftl, color: MID}, // top left
    {source: nbl, target: fbl, color: MID}, // bottom left
    {source: ntr, target: ftr, color: MID}, // top right
    {source: nbr, target: fbr, color: MID} // bottom right
  ];
}

function getIntersection(plane1, plane2, plane3) {
  // p.dot(plane.normal) = plane.distance
  const vx = [plane1.normal[0], plane2.normal[0], plane3.normal[0]];
  const vy = [plane1.normal[1], plane2.normal[1], plane3.normal[1]];
  const vz = [plane1.normal[2], plane2.normal[2], plane3.normal[2]];
  const vd = [plane1.distance, plane2.distance, plane3.distance];

  const numerator = mat3.determinant([vx, vy, vz].flat());
  const dx = mat3.determinant([vd, vy, vz].flat());
  const dy = mat3.determinant([vx, vd, vz].flat());
  const dz = mat3.determinant([vx, vy, vd].flat());

  return [dx / numerator, dy / numerator, dz / numerator];
}
