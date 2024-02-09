import {Texture2D, Texture2DProps, Buffer, readPixelsToBuffer} from '@luma.gl/webgl';
import {isWebGL2} from '@luma.gl/gltools';
import * as tf from '@tensorflow/tfjs';
import type {MathBackendWebGL} from '@tensorflow/tfjs-backend-webgl';

/** A luma.gl Texture class that wraps an externally created WebGLTexture handle */
export class PassthroughTexture extends Texture2D {
  loaded: boolean;
  data: Float32Array;

  // Skip data upload
  setImageData(props: any): this {
    this.loaded = true;
    this.data = props.data as Float32Array;
    return this;
  }
}

/** Get a Texture2D that wraps a Tensor for shader sampling */
export function tensorToTexture(
  opts: Omit<Texture2DProps, 'data'> & {
    data: tf.Tensor<tf.Rank>;
    /** Read data out from the GPU for CPU access */
    readToCPU?: boolean;
    channels?: 'R' | 'RGBA';
  }
): Texture2D {
  const {data, readToCPU, width, height, channels} = opts;

  const backend = tf.backend() as MathBackendWebGL;
  const gl = backend.getGPGPUContext().gl;

  const source = channels === 'RGBA' ? tf.stack([data, data, data, data], data.shape.length) : data;
  const texData = source.dataToGPU(
    Number.isFinite(width)
      ? {
          customTexShape: [height, width]
        }
      : {}
  );

  return new PassthroughTexture(gl, {
    ...opts,
    width: width || texData.texShape[1],
    height: height || texData.texShape[0],
    mipmaps: false,
    handle: texData.texture,
    data: readToCPU ? new Float32Array(data.flatten().arraySync()) : null
  });
}

/** Get a luma.gl Buffer from a Tensor */
export function tensorToBuffer(data: tf.Tensor<tf.Rank>): Buffer {
  const backend = tf.backend() as MathBackendWebGL;
  const gl = backend.getGPGPUContext().gl;

  const texData = backend.texData.get(data.dataId);

  if (texData.texture && isWebGL2(gl)) {
    return readPixelsToBuffer(
      tensorToTexture({
        data
      }),
      {
        sourceType: gl.FLOAT
      }
    );
  }

  // Data is on CPU not GPU
  return new Buffer(gl, {data: new Float32Array(data.flatten().arraySync())});
}
