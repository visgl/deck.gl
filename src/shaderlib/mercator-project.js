// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
const PI = Math.PI;
const pow = Math.pow;
const tan = Math.tan;
const log = Math.log;
const atan = Math.atan;
const exp = Math.exp;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;

function radians(value) {
  return value * DEGREES_TO_RADIANS;
}

function degrees(value) {
  return value * RADIANS_TO_DEGREES;
}

// see: https://en.wikipedia.org/wiki/Web_Mercator
export default function WebMercatorProjection({
  tileSize = 512,
  longitude,
  latitude,
  zoom,
  width = 256,
  height = 256
}) {
  const scale = (tileSize || 512) * 0.5 / PI * pow(2, zoom);
  const lamda = radians(longitude);
  const phi = radians(latitude);
  const x = scale * (lamda + PI);
  const y = scale * (PI - log(tan(PI * 0.25 + phi * 0.5)));
  const offsetX = width * 0.5 - x;
  const offsetY = height * 0.5 - y;

  function project(lnglat2) {
    const lamda2 = lnglat2[0] * DEGREES_TO_RADIANS;
    const phi2 = lnglat2[1] * DEGREES_TO_RADIANS;
    const x2 = scale * (lamda2 + PI);
    const y2 = scale * (PI - log(tan(PI * 0.25 + phi2 * 0.5)));
    return [x2, y2];
  }

  function unproject(xy) {
    const x2 = xy[0];
    const y2 = xy[1];
    const lamda2 = x2 / scale - PI;
    const phi2 = 2 * (atan(exp(PI - y2 / scale)) - PI * 0.25);
    return [degrees(lamda2), degrees(phi2)];
  }

  function getViewMatrix4() {
    return [
      1, 0, 0, -offsetX,
      0, 1, 0, -offsetY,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  function projectViewport(lnglat2) {
    const lamda2 = lnglat2[0] * DEGREES_TO_RADIANS;
    const phi2 = lnglat2[1] * DEGREES_TO_RADIANS;
    const x2 = scale * (lamda2 + PI);
    const y2 = scale * (PI - log(tan(PI * 0.25 + phi2 * 0.5)));
    return [x2 + offsetX, y2 + offsetY];
  }

  function unprojectViewport(xy) {
    const x2 = xy[0] - offsetX;
    const y2 = xy[1] - offsetY;
    const lamda2 = x2 / scale - PI;
    const phi2 = 2 * (atan(exp(PI - y2 / scale)) - PI * 0.25);
    return [degrees(lamda2), degrees(phi2)];
  }

  function viewportContains(lnglat2) {
    const xy = project(lnglat2);
    const x1 = xy[0];
    const y1 = xy[1];
    return (
      x1 >= 0 && x1 <= opts.width &&
      y1 >= 0 && y1 <= opts.height
    );
  }

  return {
    project,
    unproject,
    getViewMatrix4,
    projectViewport,
    unprojectViewport,
    viewportContains
  };
}
