import test from 'tape-catch'; // Avoid warnings on `gl` parameters
/* eslint-disable no-shadow */ import {gl} from '@deck.gl/test-utils';

import GL from '@luma.gl/constants';
import {isWebGL2, Buffer, Framebuffer, Model, readPixelsToArray} from '@luma.gl/core';
import BaseAttribute from '@deck.gl/core/lib/base-attribute';

const value1 = new Float32Array([0, 0, 0, 0, 1, 2, 3, 4]);
const value2 = new Float32Array([0, 0, 0, 0, 1, 2, 3, 4]);

function isHeadlessGL(gl) {
  return gl.getExtension('STACKGL_resize_drawingbuffer');
}

test('WebGL#BaseAttribute constructor/update/delete', t => {
  let attribute = new BaseAttribute(gl, {size: 4, value: value1});
  let {buffer} = attribute;

  t.ok(attribute instanceof BaseAttribute, 'BaseAttribute construction successful');
  t.ok(buffer instanceof Buffer, 'BaseAttribute creates buffer');
  if (isWebGL2(gl)) {
    t.deepEqual(buffer.getData(), value1, 'Buffer value is set');
  }
  t.is(attribute.target, GL.ARRAY_BUFFER, 'BaseAttribute target is inferred');
  t.is(attribute.type, GL.FLOAT, 'BaseAttribute type is inferred');
  t.is(attribute.divisor, 0, 'divisor prop is set');

  attribute.delete();
  t.notOk(buffer._handle, 'Buffer resource is released');
  t.notOk(attribute.buffer, 'BaseAttribute buffer is deleted');

  /* Indexed attribute */
  buffer = new Buffer(gl, {data: value2});
  attribute = new BaseAttribute(gl, {size: 4, isIndexed: true, buffer});

  t.ok(attribute instanceof BaseAttribute, 'Indexed attribute construction successful');
  t.notOk(
    attribute.buffer,
    'BaseAttribute does not create buffer when external buffer is supplied'
  );
  t.is(attribute.target, GL.ELEMENT_ARRAY_BUFFER, 'BaseAttribute target is inferred');

  attribute.delete();
  t.ok(buffer._handle, 'External buffer is not deleted');

  attribute = new BaseAttribute(gl, {size: 1, isIndexed: true});
  t.is(attribute.type, GL.UNSIGNED_INT, 'type is auto inferred');

  attribute = new BaseAttribute(null, {size: 4, value: value1});
  t.ok(
    attribute instanceof BaseAttribute,
    'BaseAttribute construction successful without GL context'
  );

  t.end();
});

test('WebGL#BaseAttribute update', t => {
  const attribute = new BaseAttribute(gl, {size: 4, value: value1});
  let {buffer} = attribute;

  attribute.update({value: value2});
  t.is(attribute.buffer, buffer, 'Buffer is reused');
  if (isWebGL2(gl)) {
    t.deepEqual(buffer.getData(), value2, 'Buffer value is updated');
  }

  attribute.update({divisor: 1});
  t.is(attribute.divisor, 1, 'divisor prop is updated');

  attribute.update({divisor: 0});
  t.is(attribute.divisor, 0, 'divisor prop is updated');

  // gpu aggregation use case
  buffer = new Buffer(gl, {byteLength: 1024, accessor: {type: GL.FLOAT, divisor: 1}});
  buffer = new Buffer(gl, {byteLength: 1024, accessor: {type: GL.FLOAT, divisor: 1}});
  attribute.update({buffer});
  t.is(attribute.divisor, 1, 'divisor prop is updated using buffer prop');

  attribute.delete();

  t.end();
});

test('WebGL#BaseAttribute getBuffer', t => {
  const attribute = new BaseAttribute(gl, {size: 4, value: value1});
  t.is(attribute.getBuffer(), attribute.buffer, 'getBuffer returns own buffer');

  const buffer = new Buffer(gl, {data: value1});
  attribute.update({buffer});
  t.is(attribute.getBuffer(), buffer, 'getBuffer returns user supplied buffer');

  attribute.update({value: value2});
  t.is(attribute.getBuffer(), attribute.buffer, 'getBuffer returns own buffer');

  attribute.update({constant: true, value: [0, 0, 0, 0]});
  t.is(attribute.getBuffer(), null, 'getBuffer returns null for generic attributes');

  attribute.update({buffer});
  t.is(attribute.getBuffer(), buffer, 'getBuffer returns user supplied buffer');

  attribute.delete();

  t.end();
});

test('WebGL#BaseAttribute getValue', t => {
  const attribute = new BaseAttribute(gl, {size: 4, value: value1});
  t.is(attribute.getValue()[0], attribute.buffer, 'getValue returns own buffer');

  const buffer = new Buffer(gl, {data: value1});
  attribute.update({buffer});
  t.is(attribute.getValue()[0], buffer, 'getValue returns user supplied buffer');

  attribute.update({value: value2});
  t.is(attribute.getValue()[0], attribute.buffer, 'getValue returns own buffer');

  attribute.update({constant: true, value: value1});
  t.deepEquals(
    attribute.getValue(),
    value1.slice(0, 4),
    'getValue returns generic value, truncated to size'
  );

  attribute.update({buffer});
  t.is(attribute.getValue()[0], buffer, 'getValue returns user supplied buffer');

  attribute.delete();

  t.end();
});

// If the vertex shader has more components than the array provides,
// the extras are given values from the vector (0, 0, 0, 1) for the missing XYZW components.
// https://www.khronos.org/opengl/wiki/Vertex_Specification#Vertex_format
test('BaseAttribute#missing component', t => {
  if (isHeadlessGL(gl)) {
    // headless-gl does not seem to implement this behavior
    t.comment('Skipping headless-gl');
    t.end();
    return;
  }

  const getModel = (gl, {attributeName, type, accessor}) =>
    new Model(gl, {
      vs: `
  attribute vec3 position;
  attribute ${type} ${attributeName};
  varying vec4 vColor;
  void main(void) {
    vColor = vec4(${accessor});
    gl_Position = vec4(position.xy, 0.0, 1.0);
    gl_PointSize = 2.0;
  }
  `,
      fs: `
  precision highp float;
  varying vec4 vColor;
  void main(void) {
    gl_FragColor = vColor;
  }
  `,
      drawMode: GL.POINTS,
      vertexCount: 4,
      attributes: {
        position: [
          new Buffer(gl, new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])),
          {size: 3}
        ]
      }
    });

  function getTestCases(gl) {
    return [
      // This doesn't work for vec2
      // {
      //   attributeName: 'texCoord',
      //   type: 'vec2',
      //   accessor: 'texCoord, 0.0, 1.0',
      //   attributes: {
      //     size: {
      //       size: 1,
      //       value: new Float32Array([0.5, 1, 0.25, 0])
      //     }
      //   },
      //   output: [128, 0, 0, 255, 255, 0, 0, 255, 64, 0, 0, 255, 0, 0, 0, 255]
      // },
      {
        attributeName: 'size',
        type: 'vec3',
        accessor: 'size, 1.0',
        attributes: {
          size: [new Buffer(gl, new Float32Array([0.5, 0, 1, 0.5, 0, 1, 0.5, 1])), {size: 2}]
        },
        output: [128, 0, 0, 255, 255, 128, 0, 255, 0, 255, 0, 255, 128, 255, 0, 255]
      },
      {
        attributeName: 'size',
        type: 'vec3',
        accessor: 'size, 1.0',
        attributes: {
          size: [
            new Buffer(gl, new Float32Array([0.5, 0, 1, 1, 0.5, 1, 0, 1, 1, 0.5, 1, 1])),
            {size: 2, stride: 12}
          ]
        },
        output: [128, 0, 0, 255, 255, 128, 0, 255, 0, 255, 0, 255, 128, 255, 0, 255]
      },
      {
        attributeName: 'color',
        type: 'vec4',
        accessor: 'color / 255.0',
        attributes: {
          color: [
            new Buffer(
              gl,
              new Uint8ClampedArray([32, 100, 40, 64, 64, 64, 128, 0, 0, 255, 18, 255])
            ),
            {size: 3}
          ]
        },
        output: [32, 100, 40, 1, 64, 64, 64, 1, 128, 0, 0, 1, 255, 18, 255, 1]
      }
    ];
  }

  // Tests from luma.gl originally iterated over both WebGL1 and WebGL2 contexts
  // for (const contextName in contexts) {
  //   const gl = contexts[contextName];

  if (gl) {
    t.comment(isWebGL2(gl) ? 'WebGL2' : 'WebGL1');
    const testCases = getTestCases(gl);

    testCases.forEach(tc => {
      const model = getModel(gl, tc);
      const framebuffer = new Framebuffer(gl, {width: 2, height: 2});

      model.draw({
        framebuffer,
        attributes: tc.attributes,
        parameters: {viewport: [0, 0, 2, 2]}
      });

      t.deepEqual(
        Array.from(readPixelsToArray(framebuffer)),
        tc.output,
        `${tc.type} missing components have expected values`
      );

      // Release resources
      framebuffer.delete();
      model.delete();
    });
  }

  t.end();
});

test('BaseAttribute#offset', t => {
  const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  let attribute = new BaseAttribute(gl, {size: 4, constant: true, value: IDENTITY_MATRIX});
  t.deepEqual(attribute.getValue(), [1, 0, 0, 0], 'Constant value set without offset');
  t.is(attribute.elementOffset, 0, 'elementOffset is set');

  attribute = new BaseAttribute(gl, {size: 4, offset: 16, constant: true, value: IDENTITY_MATRIX});
  t.deepEqual(attribute.getValue(), [0, 1, 0, 0], 'Constant value set with offset');
  t.is(attribute.elementOffset, 4, 'elementOffset is set');

  attribute = new BaseAttribute(gl, {
    size: 4,
    type: GL.UNSIGNED_BYTE,
    offset: 8,
    constant: true,
    value: IDENTITY_MATRIX
  });
  t.deepEqual(attribute.getValue(), [0, 0, 1, 0], 'Constant value set with offset');
  t.is(attribute.elementOffset, 8, 'elementOffset is set');

  t.end();
});
