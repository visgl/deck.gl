/* create a tagmap instance, set colorscheme, sizeMeasurer */
/* eslint-disable max-len */
/* global document */
import TagMap from 'tagmap.js';
import rbush from 'rbush';
import {lngLatToWorld, worldToLngLat} from 'viewport-mercator-project';

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
    this.textSizes = {};
    this.weightThreshold = 1;

    // cache of layout results
    this.clusterCache = {};
  }

  setData(data, {getLabel, getPosition, getWeight}) {
    this.textSizes = {};
    data.forEach(d => {
      const label = getLabel(d);
      this.textSizes[label] = this.ctx.measureText(label).width;
    });

    this.tagMap = new TagMap();
    this.tagMap.buildHierarchy(data, {getLabel, getPosition, getWeight});
    this.clusterCache = {};
  }

  extractCluster({scale, weightThreshold}) {
    const project = lngLat => lngLatToWorld(lngLat, scale);

    const tagList = this.tagMap.extractCluster({project, weightThreshold});

    tagList.forEach(tag => {
      tag.minX = tag.center[0];
      tag.minY = tag.center[1];
      tag.maxX = tag.center[0];
      tag.maxY = tag.center[1];
    });
    const cluster = rbush();
    cluster.load(tagList);

    return cluster;
  }

  layout({tagList, scale, minFontSize, maxFontSize}) {
    const tags = this.tagMap.layout({
      tagList,
      minFontSize,
      maxFontSize,
      maxNumOfTags: 150,
      sizeMeasurer: this.measureText
    });

    // transform tags to the format that are used to be visualized as icons in the deckgl layer
    tags.forEach(tag => {
      tag.position = worldToLngLat(tag.center, scale);
    });

    return tags;
  }

  getTags({zoom, bbox, minFontSize, maxFontSize, weightThreshold}) {
    if (weightThreshold !== this.weightThreshold) {
      this.weightThreshold = weightThreshold;
      this.clusterCache = {};
    }

    const scale = Math.pow(2, zoom);

    const cluster = this.clusterCache[zoom] || this.extractCluster({scale, weightThreshold});
    this.clusterCache[zoom] = cluster;

    let tagList;
    if (bbox) {
      const sw = lngLatToWorld([bbox.minX, bbox.minY], scale);
      const ne = lngLatToWorld([bbox.maxX, bbox.maxY], scale);
      tagList = cluster.search({
        minX: sw[0],
        minY: ne[1],
        maxX: ne[0],
        maxY: sw[1]
      });
    } else {
      tagList = cluster.all();
    }

    return this.layout({
      tagList,
      scale,
      minFontSize,
      maxFontSize
    });
  }

  measureText(label, fontSize) {
    const width = this.textSizes[label];
    return {width: (width / 10) * fontSize, height: fontSize};
  }
}
