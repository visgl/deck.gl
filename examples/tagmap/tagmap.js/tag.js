/* eslint-disable max-len */
// the unit element in the tag map
export default class Tag {
  constructor(label) {
    this.label = label;
    this.coords = [];
    // center of coords
    this.center = [0, 0];
    this.weight = 0;

    // size of bounding box
    this.width = 0;
    this.height = 0;
  }

  // loc: screen coords [x, y]
  add(loc, weight) {
    const {coords, center} = this;
    coords.push(loc);

    const len = coords.length;
    // update center
    center[0] = (center[0] * (len - 1) + loc[0]) / len;
    center[1] = (center[1] * (len - 1) + loc[1]) / len;
    // update weight
    this.weight += weight;
  }

  setCenter(pt) {
    // force set center in the overlap removal loop
    this.center = pt;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  dist(loc) {
    return Math.sqrt(Math.pow((this.center[0] - loc[0]), 2) + Math.pow((this.center[1] - loc[1]), 2));
  }

  overlap(tag) {
    return Math.abs(tag.center[0] - this.center[0]) <= (tag.width + this.width) * 0.5 &&
            Math.abs(tag.center[1] - this.center[1]) <= (tag.height + this.height) * 0.5;
  }
}
