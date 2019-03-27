"use strict";module.export({compileVertexShader:()=>compileVertexShader});var Compiler;module.link('glsl-transpiler',{default(v){Compiler=v}},0);// TODO - move to @luma.gl/debug ?


const compileVS = Compiler({
  uniform: name => `uniforms.${name}`
});

// @returns JavaScript function of the transpiled shader
function compileVertexShader(source) {
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
  return module.runSetters(eval(script));
}
