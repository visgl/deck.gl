/* eslint-disable max-len */
import {scaleLog} from 'd3-scale';
import Tag from './tag';
import rbush from 'rbush';
import ClusterTree from 'hdbscanjs';

const RADIANS_PER_DEGREE =  Math.PI / 180;
// screen-space aggregation threshold
const DEFAULT_MAX_DIST = 20;
// max number of tags shown in the view
const DEFAULT_MAX_NUMBER_OF_TAGS = 100;

export default class TagMap {
  constructor(distFunc = ClusterTree.distFunc.euclidean) {
    this.tagTree = {};
    this.tagList = [];
    this.distFunc = distFunc;
  }

  buildHierarchy(data, {
    getLabel = val => val.label,
    getPosition = val => val.position,
    getWeight = val => val.weight
  }) {
    // clear tree
    this.tagTree = {};
    const {tagTree, distFunc} = this;

    // group tags based on the content
    data.forEach(val => {
      const label = getLabel(val);
      if (!tagTree.hasOwnProperty(label)) {
        tagTree[label] = [];
      }
      tagTree[label].push({data: getPosition(val), opt: getWeight(val)});
    });
    for (const key in tagTree) {
      const cluster = new ClusterTree(tagTree[key], distFunc);
      tagTree[key] = cluster.getTree();
    }
  }

  extractCluster({
    project = val => val,
    bbox = null,
    weightThreshold = 0,
    maxDist = DEFAULT_MAX_DIST
  }) {
    // clear tagList
    this.tagList = [];
    const {tagTree, tagList} = this;
    const maxDistSq = maxDist * maxDist;

    for (const key in tagTree) {
      const tree = tagTree[key];
      const flagCluster = tree.filter(val => {
        // a cluster of a single point
        if (val.isLeaf) {
          return true;
        }
        // test the cluster does not split under the current zoom level
        const cp0 = project(val.edge[0]);
        const cp1 = project(val.edge[1]);
        const dx = cp0[0] - cp1[0];
        const dy = cp0[1] - cp1[1];
        return dx * dx + dy * dy < maxDistSq;
      }, bbox);

      // generate tags which passed the test and weightThreshold
      const tags = flagCluster.forEach(val => {
        const tag = new Tag(key);
        val.data.forEach((p, i) => tag.add(p, val.opt[i]));

        if (tag.weight >= weightThreshold) {
          tag.setCenter(project(tag.center));
          tagList.push(tag);
        }
      });
    }
    return tagList;
  }

  _getScale(minWeight, maxWeight, minFontSize, maxFontSize) {
    if (minWeight === maxWeight) {
      return x => minFontSize;
    }
    // set log scale for label size
    return scaleLog().base(Math.E)
                      .domain([minWeight, maxWeight])
                      .range([minFontSize, maxFontSize]);
  }

  // center is two element array
  _rotate(center, angle, radius, out) {
    const radian = angle * RADIANS_PER_DEGREE;
    out[0] = Math.cos(radian) * radius + center[0];
    out[1] = Math.sin(radian) * radius + center[1];
  }

  // forcely place tag without overlap removal
  _forcePlaceTag(placedTag, tree, tag) {
    placedTag.push(tag);
  }

  // a greedy circular layout method
  _placeTag(placedTag, tree, tag) {
    let angle = -90.0;
    const deltaAngle = 25;
    let radius = 0;
    const deltaRadius = 1.5;
    let iter = 0;
    const iterThreshold = 20;

    const p = [];
    const bbox = {};

    while (iter <= iterThreshold) {
      // calculate the new candidate position
      this._rotate(tag.center, angle, radius, p);
      bbox.minX = p[0] - tag.width * 0.5;
      bbox.maxX = p[0] + tag.width * 0.5;
      bbox.minY = p[1] - tag.height * 0.5;
      bbox.maxY = p[1] + tag.height * 0.5;

      // if no collision, position the tag
      if (!tree.collides(bbox)) {
        tag.setCenter(p);
        placedTag.push(tag);
        tree.insert(bbox);
        break;
      }
      // increment angle and radius
      angle += deltaAngle;
      radius += deltaRadius;
      iter++;
    }
  }

  layout({
    tagList = this.tagList,
    minFontSize,
    maxFontSize,
    sizeMeasurer,
    isForce = false,
    maxNumOfTags = DEFAULT_MAX_NUMBER_OF_TAGS
  }) {
    if (!tagList || tagList.length === 0) {
      return [];
    }
    // get tags in descending order
    const orderedTags = tagList.sort((a, b) => b.weight - a.weight);
    // get scale function to calculate size of label bounding box
    const minWeight = orderedTags[orderedTags.length - 1].weight;
    const maxWeight = orderedTags[0].weight;
    const sizeScale = this._getScale(minWeight, maxWeight, minFontSize, maxFontSize);

    // calculate bounding box
    orderedTags.forEach(x => {
      const fontSize = sizeScale(x.weight);
      const {width, height} = sizeMeasurer(x.label, fontSize);
      x.setSize(width, height);
    });

    // run actual layout algorithm
    const placedTag = [];
    const tree = rbush();
    for (const tag of orderedTags) {
      if (placedTag.length >= maxNumOfTags) {
        break;
      }
      if (isForce) {
        this._forcePlaceTag(placedTag, tree, tag);
      } else {
        this._placeTag(placedTag, tree, tag);
      }
    }
    return placedTag;
  }
}
