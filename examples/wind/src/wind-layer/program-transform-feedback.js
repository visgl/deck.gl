import {Program} from 'luma.gl';

export default class ProgramTransformFeedback extends Program {

  _compileAndLink() {
    const {gl} = this;
    gl.attachShader(this.handle, this.vs.handle);
    gl.attachShader(this.handle, this.fs.handle);
    // enable transform feedback for this program
    gl.transformFeedbackVaryings(this.handle, ["gl_Position"], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(this.handle);
    gl.validateProgram(this.handle);
    const linked = gl.getProgramParameter(this.handle, gl.LINK_STATUS);
    if (!linked) {
      throw new Error(`Error linking ${gl.getProgramInfoLog(this.handle)}`);
    }
  }
}