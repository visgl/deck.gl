// KeyValueObject ========================================

const KeyValueObject = {};

KeyValueObject.read = function (pbf, end) {
  return pbf.readFields(KeyValueObject._readField, {key: '', value: ''}, end);
};
KeyValueObject._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = pbf.readString();
};

// Properties ========================================

const Properties = {};

Properties.read = function (pbf, end) {
  return pbf.readFields(Properties._readField, {data: []}, end);
};
Properties._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.data.push(KeyValueObject.read(pbf, pbf.readVarint() + pbf.pos));
};

// Doubles ========================================

const Doubles = {};

Doubles.read = function (pbf, end) {
  // TODO perhaps we can do better and directly map from the source
  // ArrayBuffer using ArrayBuffer.slice()
  const {value, size} = pbf.readFields(Doubles._readField, {value: [], size: 0}, end);
  return {value: new Float32Array(value), size};
};
Doubles._readField = function (tag, obj, pbf) {
  if (tag === 1) pbf.readPackedDouble(obj.value);
  else if (tag === 2) obj.size = pbf.readVarint(true);
};

// Ints ========================================

const Ints = {};

Ints.read = function (pbf, end) {
  const {value, size} = pbf.readFields(Ints._readField, {value: [], size: 0}, end);
  return {value: new Uint32Array(value), size};
};
Ints._readField = function (tag, obj, pbf) {
  if (tag === 1) pbf.readPackedVarint(obj.value);
  else if (tag === 2) obj.size = pbf.readVarint(true);
};

// NumericProp ========================================

const NumericProp = {};

NumericProp.read = function (pbf, end) {
  return pbf.readFields(NumericProp._readField, {value: []}, end);
};
NumericProp._readField = function (tag, obj, pbf) {
  if (tag === 1) pbf.readPackedDouble(obj.value);
};

// NumericPropKeyValue ========================================

const NumericPropKeyValue = {};

NumericPropKeyValue.read = function (pbf, end) {
  return pbf.readFields(NumericPropKeyValue._readField, {key: '', value: null}, end);
};
NumericPropKeyValue._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = NumericProp.read(pbf, pbf.readVarint() + pbf.pos);
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

const StringProp = {};

StringProp.read = function (pbf, end) {
  return pbf.readFields(StringProp._readField, {value: []}, end);
};
StringProp._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.value.push(pbf.readString());
};

// Points ========================================

const Points = {};

Points.read = function (pbf, end) {
  return pbf.readFields(
    Points._readField,
    {positions: null, globalFeatureIds: null, featureIds: null, properties: [], numericProps: {}},
    end
  );
};
Points._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.positions = Doubles.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 2) obj.globalFeatureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.featureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 5) {
    const entry = NumericPropKeyValue.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
};

// Lines ========================================

const Lines = {};

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
  if (tag === 1) obj.positions = Doubles.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 2) obj.pathIndices = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.globalFeatureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.featureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 5) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 6) {
    const entry = NumericPropKeyValue.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
};

// Polygons ========================================

const Polygons = {};

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
  if (tag === 1) obj.positions = Doubles.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 2) obj.polygonIndices = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 3) obj.globalFeatureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 4) obj.featureIds = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 5) obj.primitivePolygonIndices = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 6) obj.triangles = Ints.read(pbf, pbf.readVarint() + pbf.pos);
  else if (tag === 7) obj.properties.push(Properties.read(pbf, pbf.readVarint() + pbf.pos));
  else if (tag === 8) {
    const entry = NumericPropKeyValue.read(pbf, pbf.readVarint() + pbf.pos);
    obj.numericProps[entry.key] = entry.value;
  }
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
