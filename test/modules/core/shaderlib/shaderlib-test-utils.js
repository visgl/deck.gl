// TODO - move to @luma.gl/debug ?
import Compiler from 'glsl-transpiler';

const normalizeSource = source =>
  source
    // prepr (GLSL preprocessor) does not like #define without value
    .replace(/^(#define \w+) *$/gm, ($0, $1) => `${$1} 1`)
    // replace negate due to glsl-transpiler issue #44
    .replace(/(= |\()-([a-z])/g, ($0, $1, $2) => `${$1}-1.0 * ${$2}`);

const compileVS = Compiler({
  uniform: name => `uniforms.${name}`
});

// @returns JavaScript function of the transpiled shader
export function compileVertexShader(source) {
  source = normalizeSource(source);

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
