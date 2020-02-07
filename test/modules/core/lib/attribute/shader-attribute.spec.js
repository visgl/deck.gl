import DataColumn from '@deck.gl/core/lib/attribute/data-column';
import ShaderAttribute from '@deck.gl/core/lib/attribute/shader-attribute';
import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';
import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';

test('ShaderAttribute#constructor', t => {
  const dataColumn = new DataColumn(gl, {id: 'test-data', size: 3});

  const shaderAttribute = new ShaderAttribute(dataColumn, {id: 'test-attribute', divisor: 0});
  t.ok(shaderAttribute, 'ShaderAttribute constructed');

  t.end();
});

test('ShaderAttribute#getValue#constant', t => {
  const dataColumn1 = new DataColumn(gl, {
    id: 'colors',
    type: GL.UNSIGNED_BYTE,
    defaultValue: [0, 0, 0, 255],
    size: 4,
    normalized: true
  });
  const dataColumn2 = new DataColumn(gl, {id: 'matrices', size: 12});
  const shaderAttribute1 = new ShaderAttribute(dataColumn1, {id: 'colors'});
  const shaderAttribute2 = new ShaderAttribute(dataColumn2, {
    id: 'matrices_col2',
    size: 4,
    elementOffset: 4
  });

  t.notOk(shaderAttribute1.getValue(), 'no value is set');

  dataColumn1.setData({constant: true, value: [255, 0, 0]});
  t.deepEqual(shaderAttribute1.getValue(), [1, 0, 0, 1], 'gets correct value');

  dataColumn2.setData({constant: true, value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]});
  t.deepEqual(shaderAttribute2.getValue(), [0, 1, 0, 0], 'gets correct value');

  dataColumn1.delete();
  dataColumn2.delete();
  t.end();
});

/* eslint-disable max-statements */
test('ShaderAttribute#getValue#buffer', t => {
  const dataColumn = new DataColumn(gl, {id: 'positions', size: 3});
  const buffer = new Buffer(gl, {data: new Float32Array([1, 1, 1])});
  const shaderAttribute1 = new ShaderAttribute(dataColumn, {divisor: 0});
  const shaderAttribute2 = new ShaderAttribute(dataColumn, {divisor: 1});

  t.notOk(shaderAttribute1.getValue(), 'no value is set');
  dataColumn.setData({
    value: new Float32Array([1, 1, 1, 2, 2, 2, 3, 3, 3])
  });
  let value = shaderAttribute1.getValue();
  t.is(value[0], dataColumn.buffer, 'using internal buffer from source data');
  t.is(value[1].type, GL.FLOAT, 'accessor has correct type');
  t.is(value[1].size, 3, 'accessor has correct size');
  t.is(value[1].divisor, 0, 'accessor has correct divisor');
  t.is(value[1].stride, 12, 'accessor has correct stride');
  value = shaderAttribute2.getValue();
  t.is(value[1].divisor, 1, 'accessor has correct divisor');

  dataColumn.setData({
    value: new Uint8ClampedArray([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]),
    stride: 4,
    divisor: 1
  });
  value = shaderAttribute1.getValue();
  t.is(value[1].type, GL.UNSIGNED_BYTE, 'accessor has correct type');
  t.is(value[1].divisor, 0, 'accessor has correct divisor');
  t.is(value[1].stride, 4, 'accessor has correct stride');

  dataColumn.setData({buffer});
  value = shaderAttribute1.getValue();
  t.is(value[0], buffer, 'using external buffer');
  t.is(value[1].type, GL.FLOAT, 'accessor has correct type');
  t.is(value[1].stride, 12, 'accessor has correct stride');

  dataColumn.delete();
  buffer.delete();
  t.end();
});
