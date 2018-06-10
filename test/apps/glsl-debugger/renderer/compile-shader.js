/*
 * Need to manunally fix this bug in node_modules/glsl-transpiler/lib/operators.js:
 * https://github.com/stackgl/glsl-transpiler/issues/34
 */
import Compiler from 'glsl-transpiler';

const normalize = source =>
  source
    // prepr does not like #define without value
    .replace(/^(#define \w+) *$/gm, ($0, $1) => `${$1} 1`);

const compileVS = Compiler({
  uniform: name => `uniforms.${name}`,
  attribute: name => `attributes.${name}`
});

const compileFS = Compiler({
  uniform: name => `uniforms.${name}`,
  attribute: name => `attributes.${name}`,
  varying: name => `varyings.${name}`
});

// @returns JavaScript function of the transpiled shader
export function compileVertexShader(name, source) {
  source = normalize(source);

  const compiledSource = compileVS(source);
  const {compiler} = compileVS;

  // TODO - input validation?
  const stats = {
    attributes: compiler.attributes,
    uniforms: compiler.uniforms,
    varyings: compiler.varyings,
    functions: compiler.functions
  };
  compiler.reset();

  return evalScript(
    `function vs(uniforms, attributes) {
  var gl_Position;
  ${compiledSource}
  /* End of shader code */
  main();
  return {
    gl_Position,
    varyings: {${Object.keys(stats.varyings).join(', ')}}
  };
}`,
    name
  );
}

// @returns JavaScript function of the transpiled shader
export function compileFragmentShader(name, source) {
  source = normalize(source);

  const compiledSource = compileFS(source);
  const {compiler} = compileFS;

  // TODO - input validation?
  // const stats = {
  //   uniforms: compiler.uniforms,
  //   varyings: compiler.varyings,
  //   functions: compiler.functions
  // };
  compiler.reset();

  return evalScript(
    `function fs(uniforms, varyings) {
  var gl_FragColor;
  var isDiscarded = false;
  function discard() {
    isDiscarded = true;
  }
  ${compiledSource}
  /* End of shader code */
  main();
  return {
    gl_FragColor,
    isDiscarded
  };
}`,
    name
  );
}

/* eslint-disable no-eval */
function evalScript(value, name) {
  const script = `(function() { return ${value}; })()
//# sourceURL=${name}.js`;
  return eval(script);
}
