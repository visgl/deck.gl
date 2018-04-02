/* create a tagmap instance, set colorscheme, sizeMeasurer */
/* eslint-disable max-len */
/* global document */
import TagMap from 'tagmap.js';

function getDrawingContext() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '10px "Lucida Console", Monaco, monospace';
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'hanging';
  ctx.textAlign = 'left';

  return ctx;
}

export default class TagMapWrapper {
  constructor() {
    this.tagMap = null;
    this.ctx = getDrawingContext();
    this.measureText = this.measureText.bind(this);
  }

  setData(data, {getLabel, getPosition, getWeight}) {
    this.tagMap = new TagMap();
    this.tagMap.buildHierarchy(data, {getLabel, getPosition, getWeight});
  }

  getTags({transform, minFontSize, maxFontSize, weightThreshold}) {
    if (!this.tagMap) {
      throw new Error('TagMapWrapper not initialized');
    }

    const {project, unproject} = transform;

    this.tagMap.extractCluster({project, weightThreshold});
    const tags = this.tagMap.layout({
      minFontSize,
      maxFontSize,
      maxNumOfTags: Infinity,
      sizeMeasurer: this.measureText
    });

    // transform tags to the format that are used to be visualized as icons in the deckgl layer
    tags.forEach(tag => {
      tag.position = unproject(tag.center);
    });

    return tags;
  }

  measureText(label, fontSize) {
    const {width} = this.ctx.measureText(label);
    return {width: width / 10 * fontSize, height: fontSize};
  }
}
