import pickingFragment from './picking.fragment.glsl';
import pickingVertex from './picking.vertex.glsl';

module.exports = {
  project: {
    interface: 'project',
    source: pickingVertex,
    fragmentSource: pickingFragment
  }
};
