/* generate tagmap layout: an occlusion-free tagcloud-like visualization on map */
/* eslint-disable max-len */
import TagMapper from './tagmapper';
import {color} from 'd3-color';
import {scaleQuantile} from 'd3-scale';

// screen-space aggregation threshold: invisible to the user
const maxDist = 20;

export function tagmapLayout(data, transform, canvas, {getLabel, getPosition, getWeight}, visParam) {

  const {minFontSize, maxFontSize, weightThreshold, colorScheme} = visParam;
  const sizeMeasurer = (fontSize, str) => measureTextWidth(canvas, fontSize, str);
  const tagmapper = new TagMapper({sizeMeasurer, maxDist, minFontSize, maxFontSize, weightThreshold});
  // add data points
  data.forEach(x => {
    tagmapper.aggregate(getLabel(x), getPosition(x), getWeight(x));
  });
  // calculate layout
  let tags = tagmapper.layout();

  // set color scale function
  const getColorRGBA = x => {
    const hex = getColorScale(minFontSize, maxFontSize, colorScheme)(x);
    const c = color(hex);
    return [c.r, c.g, c.b, c.opacity * 255];
  };

  tags = tags.map(x => ({term: x.term, position: transform.unproject(x.center), size: x.height, color: getColorRGBA(x.height)}));
  return {tags};
}

function getColorScale(minFontSize, maxFontSize, colorScheme) {
  // set log scale for label size
  return scaleQuantile().domain([
    minFontSize,
    maxFontSize
  ]).range(colorScheme);
}

// return width and height of the label
function measureTextWidth(canvas, fontSize, str) {
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px Verdana,Arial,sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'hanging';
  ctx.textAlign = 'left';
  const {width} = ctx.measureText(str);
  return {width, height: fontSize};
}
