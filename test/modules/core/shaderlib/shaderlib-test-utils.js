// TODO - move to @luma.gl/debug ?
import Compiler from 'glsl-transpiler';

const normalize = source =>
  source
    // prepr does not like #define without value
    .replace(/^(#define \w+) *$/gm, ($0, $1) => `${$1} 1`);

const compileVS = Compiler({
  uniform: name => `uniforms.${name}`
});

// @returns JavaScript function of the transpiled shader
export function compileVertexShader(source) {
  source = normalize(source);

  const compiledSource = compileVS(source);
  const {compiler} = compileVS;

  const stats = {
    attributes: compiler.attributes,
    uniforms: compiler.uniforms,
    varyings: compiler.varyings,
    functions: compiler.functions
  };
  compiler.reset();

  return evalScript(
    `function vs(uniforms) {

  ${compiledSource}

  return {
    ${Object.keys(stats.functions).join(',')}
  };
}`
  );
}

/* eslint-disable no-eval */
function evalScript(value) {
  const script = `(function() { return ${value}; })()`;
  return eval(script);
}
