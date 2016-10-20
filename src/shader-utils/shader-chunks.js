// Load shader chunks
import fp64 from '../../dist/shaderlib/fp64';
import project from '../../dist/shaderlib/project';
import project64 from '../../dist/shaderlib/project64';

module.exports = {
  ...fp64,
  ...project,
  ...project64
};
