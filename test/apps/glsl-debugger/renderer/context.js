import {GL} from 'luma.gl';

/* Draws WebGL style wireframe in a 2d canvas */
export default class DrawingContext {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  resize({width, height}) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear(opts = {}) {
    const {context} = this;
    const {width, height} = this.canvas;
    context.clearRect(0, 0, width, height);

    for (const name in opts) {
      context[name] = opts[name];
    }
  }

  /* eslint-disable complexity */
  draw({drawMode, indices, positions, colors}) {
    this.positions = positions.map(this._clipspaceToScreen, this);
    this.colors = colors.map(this._rgbaToColor, this);

    switch (drawMode) {
      case GL.POINTS: {
        for (let i = 0; i < indices.length; i++) {
          this._drawPoint(indices[i]);
        }
        break;
      }

      case GL.LINES: {
        for (let i = 0; i < indices.length - 1; i += 2) {
          this._drawLine(indices[i], indices[i] + 1);
        }
        break;
      }

      case GL.LINE_STRIP: {
        for (let i = 0; i < indices.length - 1; i++) {
          this._drawLine(indices[i], indices[i + 1]);
        }
        break;
      }

      case GL.LINE_LOOP: {
        for (let i = 0; i < indices.length; i++) {
          this._drawLine(i === 0 ? indices[indices.length - 1] : indices[i - 1], indices[i]);
        }
        break;
      }

      case GL.TRIANGLES: {
        for (let i = 0; i < indices.length - 2; i += 3) {
          this._drawTriangle(indices[i], indices[i + 1], indices[i + 2]);
        }
        break;
      }

      case GL.TRIANGLE_STRIP: {
        for (let i = 0; i < indices.length - 2; i++) {
          this._drawTriangle(indices[i], indices[i + 1], indices[i + 2]);
        }
        break;
      }

      case GL.TRIANGLE_FAN: {
        for (let i = 1; i < indices.length - 1; i++) {
          this._drawTriangle(indices[0], indices[i], indices[i + 1]);
        }
        break;
      }

      default:
        throw new Error('unknown draw mode');
    }
  }
  /* eslint-enable complexity */

  _clipspaceToScreen(position) {
    const {width, height} = this.canvas;
    const [x, y, z, w] = position;

    const depth = z / w;

    if (depth < -1 || depth > 1) {
      return null;
    }

    return [(x / w + 1) * width / 2, (1 - y / w) * height / 2];
  }

  _rgbaToColor(color) {
    if (Array.isArray(color)) {
      const rgb = color.slice(0, 3).map(x => (x * 255) | 0);
      const a = Number.isFinite(color[3]) ? color[3] : 1;
      return `rgba(${rgb.join(',')},${a.toFixed(2)})`;
    }
    return color;
  }

  _drawPoint(i) {
    const {context, positions, colors} = this;
    const p = positions[i];
    const color = colors[i];

    if (!p) {
      return;
    }
    if (color) {
      context.fillStyle = color;
    }
    context.fillRect(p[0] - 0.5, p[1] - 0.5, 1, 1);
  }

  _drawLine(i0, i1) {
    const {context, positions, colors} = this;
    const p0 = positions[i0];
    const p1 = positions[i1];
    const color0 = colors[i0];
    const color1 = colors[i1];

    if (!p0 || !p1) {
      return;
    }

    context.beginPath();
    if (color0 !== color1) {
      // Use gradient
      const gradient = context.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
      gradient.addColorStop(0, color0);
      gradient.addColorStop(1, color1);

      context.strokeStyle = gradient;
    } else if (color0) {
      // Single color
      context.strokeStyle = color0;
    }

    context.moveTo(p0[0], p0[1]);
    context.lineTo(p1[0], p1[1]);
    context.stroke();
  }

  _drawTriangle(i0, i1, i2) {
    this._drawLine(i0, i1);
    this._drawLine(i1, i2);
    this._drawLine(i2, i0);
  }
}
