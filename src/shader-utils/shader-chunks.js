// Load shader chunks
import fp64 from '../shaderlib/fp64';
import project from '../shaderlib/project';
import project64 from '../shaderlib/project64';

module.exports = {
  ...fp64,
  ...project,
  ...project64
};
