/* global window */
import {assert} from '@luma.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';
import {createGLTFObjects} from '@luma.gl/addons';

export async function convertGLTFtoScenegraph(gl, gltf, options) {
  const gltfObjects = convertGLTFtoScenegraphSync(gl, gltf, options);

  if (options.waitForFullLoad) {
    await waitForGLTFAssets(gltfObjects);
  }

  return gltfObjects;
}

export function convertGLTFtoScenegraphSync(gl, gltf, options) {
  assert(gl);
  const gltfObjects = createGLTFObjects(gl, gltf, options);
  return Object.assign({gltf}, gltfObjects);
}

async function waitForGLTFAssets(gltfObjects) {
  const remaining = [];

  gltfObjects.scenes.forEach(scene => {
    scene.traverse(model => {
      Object.values(model.model.program.uniforms).forEach(uniform => {
        if (uniform.loaded === false) {
          remaining.push(uniform);
        }
      });
    });
  });

  return await waitWhileCondition(() => remaining.some(uniform => !uniform.loaded));
}

async function waitWhileCondition(condition) {
  while (condition()) {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  }
}

/*
// LOADER

async function parse(data, options, uri, loader) {
  const gltf = await GLTFLoader.parse(data, {
    ...options,
    uri,
    decompress: true
  });

  return await convertParsedGLTFtoScenegraph(options.gl, gltf, options);
}

export default {
  name: 'GLTF Scenegraph Loader',
  extensions: ['gltf', 'glb'],
  parse
};
*/
