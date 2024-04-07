import {pushContextState, popContextState, getParameters, setParameters} from '@luma.gl/gltools';
import * as tf from '@tensorflow/tfjs';
import * as tfgl from '@tensorflow/tfjs-backend-webgl';
import {GL} from '@luma.gl/constants';

/** Helper class for sharing WebGL context between Deck and tfjs */
export class CustomTFContext {
  gl: WebGL2RenderingContext;
  ctx: tfgl.GPGPUContext;
  lastContextState: any;

  static lastContext: CustomTFContext = null;
  static contexts = new Map<WebGL2RenderingContext, CustomTFContext>();

  static getDefaultContext(gl: WebGL2RenderingContext) {
    if (!this.contexts.has(gl)) {
      this.contexts.set(gl, new CustomTFContext(gl));
    }
    return this.contexts.get(gl);
  }

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.ctx = new tfgl.GPGPUContext(gl);
  }

  tidy(func: () => void) {
    if (CustomTFContext.lastContext !== this) {
      tf.removeBackend('webgl');
      tf.registerBackend(
        'webgl',
        () => {
          return new tfgl.MathBackendWebGL(this.ctx);
        },
        2
      );
      CustomTFContext.lastContext = this;
    }

    const gl = this.gl;
    pushContextState(gl);

    if (this.lastContextState) {
      setParameters(gl, this.lastContextState);
      gl.bindVertexArray(this.lastContextState[GL.VERTEX_ARRAY_BINDING]);
      gl.bindBuffer(
        GL.ELEMENT_ARRAY_BUFFER,
        this.lastContextState[GL.ELEMENT_ARRAY_BUFFER_BINDING]
      );
    }

    tf.tidy(() => {
      func();
    });

    this.lastContextState = {
      ...getParameters(gl),
      // gl states not tracked by luma but expected by TF
      [GL.ELEMENT_ARRAY_BUFFER_BINDING]: gl.getParameter(GL.ELEMENT_ARRAY_BUFFER_BINDING),
      [GL.VERTEX_ARRAY_BINDING]: gl.getParameter(GL.VERTEX_ARRAY_BINDING)
    };
    popContextState(gl);
  }
}
