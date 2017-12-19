/* create a tagmap instance, set colorscheme, sizeMeasurer */
/* eslint-disable max-len */
/* global document */
import TagMap from 'tagmap.js';
import {color} from 'd3-color';
import {scaleQuantile} from 'd3-scale';

export default class TagMapWrapper {
  constructor() {
    this.tagMap = null;
    this.visParam = null;
    this.canvas = document.createElement('canvas');
  }

  setData(data, {getLabel, getPosition, getWeight}) {
    this.tagMap = new TagMap();
    this.tagMap.buildHierarchy(data, {getLabel, getPosition, getWeight});
  }

  setVisParam({minFontSize, maxFontSize, weightThreshold, colorScheme}) {
    this.visParam = {minFontSize, maxFontSize, weightThreshold, colorScheme};
  }

  getTags({transform, viewport}) {
    if (!this.tagMap || !this.visParam) {
      throw new Error('TagMapWrapper not initialized');
    }

    const {minFontSize, maxFontSize, weightThreshold, colorScheme} = this.visParam;
    const {project, unproject} = transform;
    const sizeMeasurer = this.getSizeMeasurer();

    // calculate geoBbox from viewport
    const corners = [
      unproject([0, 0]),
      unproject([viewport.width, 0]),
      unproject([0, viewport.height]),
      unproject([viewport.width, viewport.height])
    ];
    const bbox = {
      minX: Math.min.apply(null, corners.map(val => val[0])),
      maxX: Math.max.apply(null, corners.map(val => val[0])),
      minY: Math.min.apply(null, corners.map(val => val[1])),
      maxY: Math.max.apply(null, corners.map(val => val[1]))
    };

    this.tagMap.extractCluster({project, bbox, weightThreshold});
    const tags = this.tagMap.layout({minFontSize, maxFontSize, sizeMeasurer});

    // set color scheme
    const getColor = fontSize => {
      const hex = scaleQuantile()
        .domain([minFontSize, maxFontSize])
        .range(colorScheme)(fontSize);
      const c = color(hex);
      return [c.r, c.g, c.b, c.opacity * 255];
    };

    // transform tags to the format that are used to be visualized as icons in the deckgl layer
    return tags.map(x => ({
      label: x.label,
      position: unproject(x.center),
      size: x.height,
      color: getColor(x.height)
    }));
  }

  getSizeMeasurer() {
    return (label, fontSize) => {
      const ctx = this.canvas.getContext('2d');
      ctx.font = `${fontSize}px 'Lucida Console', Monaco, monospace`;
      ctx.fillStyle = '#000';
      ctx.textBaseline = 'hanging';
      ctx.textAlign = 'left';
      const {width} = ctx.measureText(label);
      return {width, height: fontSize};
    };
  }
}
