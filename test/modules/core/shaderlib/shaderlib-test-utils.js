// TODO - move to @luma.gl/debug ?
import Compiler from 'glsl-transpiler';

const normalizeSource = source =>
  source
    // prepr (GLSL preprocessor) does not like #define without value
    .replace(/^(#define \w+) *$/gm, ($0, $1) => `${$1} 1`)
    // remove comments due to glsl-transpiler issue #39
    .replace(/(\/\*(.|\s)*?\*\/)|(\/\/.*)/g, '')
    // remove unecessary exponential notation due to glsl-transpiler issue #41
    .replace(/e\+00/g, '')
    // work around glsl-transpiler issue #40
    .replace(
      /(\w+\[\d\])\.x = (\S+);\s*(\w+\[\d\])\.y = (\S+);/g,
      ($0, $1, $2, $3, $4) => `${$1} = vec2(${$3}, ${$4});`
    );

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
