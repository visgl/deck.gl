/* global requestAnimationFrame */
import type {GroupNode, ModelNode} from '@luma.gl/engine';

export async function waitForGLTFAssets(gltfObjects: {scenes: GroupNode[]}): Promise<void> {
  const remaining: any[] = [];

  gltfObjects.scenes.forEach(scene => {
    scene.traverse((modelNode: ModelNode) => {
      // TODO v9 getUnforms() was removed, hack it with props.uniforms
      Object.values(modelNode.model.uniforms).forEach((uniform: any) => {
        if (uniform.loaded === false) {
          remaining.push(uniform);
        }
      });
    });
  });

  return await waitWhileCondition(() => remaining.some(uniform => !uniform.loaded));
}

async function waitWhileCondition(condition: () => boolean): Promise<void> {
  while (condition()) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
}
