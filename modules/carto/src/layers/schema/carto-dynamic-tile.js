// KeyValueObject ========================================

export const KeyValueObject = {};

KeyValueObject.read = function (pbf, end) {
  return pbf.readFields(KeyValueObject._readField, {key: '', value: ''}, end);
};
KeyValueObject._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = pbf.readString();
};

// Properties ========================================

export const Properties = {};

Properties.read = function (pbf, end) {
  return pbf.readFields(Properties._readField, {data: []}, end);
};
Properties._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.data.push(KeyValueObject.read(pbf, pbf.readVarint() + pbf.pos));
};

// Coords ========================================

export const Coords = {};

Coords.read = function (pbf, end, TypedArray) {
  TypedArray = TypedArray || Uint32Array;
  const {value, size} = pbf.readFields(Coords._readField, {value: [], size: 0}, end);
  return {value: new TypedArray(value), size};
};
Coords._readField = function (tag, obj, pbf) {
  if (tag === 1) pbf.readPackedDouble(obj.value);
  else if (tag === 2) obj.size = pbf.readVarint(true);
};

// NumericProp ========================================

export const NumericProp = {};

NumericProp.read = function (pbf, end) {
  return pbf.readFields(NumericProp._readField, {value: {}}, end);
};
NumericProp._readField = function (tag, obj, pbf) {
  if (tag === 1) {
    const entry = NumericProp._FieldEntry1.read(pbf, pbf.readVarint() + pbf.pos);
    obj.value[entry.key] = entry.value;
  }
};

// NumericProp._FieldEntry1 ========================================

NumericProp._FieldEntry1 = {};

NumericProp._FieldEntry1.read = function (pbf, end) {
  return pbf.readFields(NumericProp._FieldEntry1._readField, {key: '', value: 0}, end);
};
NumericProp._FieldEntry1._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = pbf.readDouble();
};

// StringProp ========================================

export const StringProp = {};

StringProp.read = function (pbf, end) {
  return pbf.readFields(StringProp._readField, {value: []}, end);
};
StringProp._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.value.push(pbf.readString());
};

// Points ========================================

export const Points = {};

Points.read = function (pbf, end) {
  return pbf.readFields(
    Points._readField,
    {positions: null, globalFeatureIds: null, featureIds: null, properties: [], numericProps: {}},
    end
  );
};
Points._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.positions = Coords.read(pbf, pbf.readVarint() + pbf.pos, Float32Array);
  else if (tag === 2) obj.globalFeatureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.featureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 5) {
    const entry = Points._FieldEntry5.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
};

// Points._FieldEntry5 ========================================

Points._FieldEntry5 = {};

Points._FieldEntry5.read = function (pbf, end) {
  return pbf.readFields(Points._FieldEntry5._readField, {key: '', value: null}, end);
};
Points._FieldEntry5._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = NumericProp.read(pbf, pbf.readVarint() + pbf.pos);
};

// Lines ========================================

export const Lines = {};

Lines.read = function (pbf, end) {
  return pbf.readFields(
    Lines._readField,
    {
      positions: null,
      pathIndices: null,
      globalFeatureIds: null,
      featureIds: null,
      properties: [],
      numericProps: {}
    },
    end
  );
};
Lines._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.positions = Coords.read(pbf, pbf.readVarint() + pbf.pos, Float32Array);
  else if (tag === 2) obj.pathIndices = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.globalFeatureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.featureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 5) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 6) {
    const entry = Lines._FieldEntry6.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
};

// Lines._FieldEntry6 ========================================

Lines._FieldEntry6 = {};

Lines._FieldEntry6.read = function (pbf, end) {
  return pbf.readFields(Lines._FieldEntry6._readField, {key: '', value: null}, end);
};
Lines._FieldEntry6._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = NumericProp.read(pbf, pbf.readVarint() + pbf.pos);
};

// Polygons ========================================

export const Polygons = {};

Polygons.read = function (pbf, end) {
  return pbf.readFields(
    Polygons._readField,
    {
      positions: null,
      polygonIndices: null,
      globalFeatureIds: null,
      featureIds: null,
      primitivePolygonIndices: null,
      triangles: null,
      properties: [],
      numericProps: {}
    },
    end
  );
};
Polygons._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.positions = Coords.read(pbf, pbf.readVarint() + pbf.pos, Float32Array);
  else if (tag === 2) obj.polygonIndices = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.globalFeatureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.featureIds = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 5) obj.primitivePolygonIndices = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 6) obj.triangles = Coords.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 7) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 8) {
    const entry = Polygons._FieldEntry8.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
};

// Polygons._FieldEntry8 ========================================

Polygons._FieldEntry8 = {};

Polygons._FieldEntry8.read = function (pbf, end) {
  return pbf.readFields(Polygons._FieldEntry8._readField, {key: '', value: null}, end);
};
Polygons._FieldEntry8._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = NumericProp.read(pbf, pbf.readVarint() + pbf.pos);
};

// Tile ========================================

export const Tile = {};

Tile.read = function (pbf, end) {
  return pbf.readFields(Tile._readField, {points: null, lines: null, polygons: null}, end);
};
Tile._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.points = Points.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 2) obj.lines = Lines.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.polygons = Polygons.read(pbf, pbf.readVarint() + pbf.pos);
};
