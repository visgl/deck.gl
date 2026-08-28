// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { lerp } from '@math.gl/core';
const availableTransformations = {
    Point,
    MultiPoint,
    LineString,
    MultiLineString,
    Polygon,
    MultiPolygon
};
function Point([pointX, pointY], [nw, se], viewport) {
    const x = lerp(nw[0], se[0], pointX);
    const y = lerp(nw[1], se[1], pointY);
    return viewport.unprojectFlat([x, y]);
}
function getPoints(geometry, bbox, viewport) {
    return geometry.map(g => Point(g, bbox, viewport));
}
function MultiPoint(multiPoint, bbox, viewport) {
    return getPoints(multiPoint, bbox, viewport);
}
function LineString(line, bbox, viewport) {
    return getPoints(line, bbox, viewport);
}
function MultiLineString(multiLineString, bbox, viewport) {
    return multiLineString.map(lineString => LineString(lineString, bbox, viewport));
}
function Polygon(polygon, bbox, viewport) {
    return polygon.map(polygonRing => getPoints(polygonRing, bbox, viewport));
}
function MultiPolygon(multiPolygon, bbox, viewport) {
    return multiPolygon.map(polygon => Polygon(polygon, bbox, viewport));
}
export function transform(geometry, bbox, viewport) {
    const nw = viewport.projectFlat([bbox.west, bbox.north]);
    const se = viewport.projectFlat([bbox.east, bbox.south]);
    const projectedBbox = [nw, se];
    return {
        ...geometry,
        coordinates: availableTransformations[geometry.type](geometry.coordinates, projectedBbox, viewport)
    };
}
//# sourceMappingURL=coordinate-transform.js.map