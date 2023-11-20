// TODO - move to @luma.gl/debug ?
import Compiler from 'glsl-transpiler';

const compileVS = Compiler({
  uniform: name => `uniforms.${name}`
});

// @returns JavaScript function of the transpiled shader
export function compileVertexShader(source) {
  const compiledSource = compileVS(source);
  const {compiler} = compileVS;
  const {functions} = compiler;
  compiler.reset();

  return evalScript(
    `function vs(uniforms) {

  ${compiledSource}

  return {
    ${Object.keys(functions).join(',')}
  };
}`
  );
}

/* eslint-disable no-eval */
function evalScript(source) {
  const script = `(function() { return ${source}; })()`;
  return eval(script);
}
