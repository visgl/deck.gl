/*
  Modified from Mikola Lysenko's parse-ply
  MIT License
*/
/* eslint-disable */
import isLittleEndian from "is-little-endian";

const PARSER_STATE = {
  BEGIN: 0,
  FORMAT: 1,
  HEADER: 2,
  BODY: 4,
  DONE: 5,
  ERROR: -1
};

const PLY_FORMAT = {
  ASCII: 0,
  BINARY_LITTLE_ENDIAN: 1,
  BINARY_BIG_ENDIAN: 2,
  UNKNOWN: -1
}

const PLY_TYPES = {
  INT: 0,
  FLOAT: 1,
  LIST: 2,
  LIST_INT: 2,
  LIST_FLOAT: 3
};

const PLY_TYPENAMES = {
  "char":     [ PLY_TYPES.INT, 1, Int8Array ],
  "int8":     [ PLY_TYPES.INT, 1, Int8Array ],
  "uchar":    [ PLY_TYPES.INT, 1, Uint8Array ],
  "uint8":    [ PLY_TYPES.INT, 1, Uint8Array ],
  "short":    [ PLY_TYPES.INT, 2, Int16Array ],
  "int16":    [ PLY_TYPES.INT, 2, Int16Array ],
  "ushort":   [ PLY_TYPES.INT, 2, Uint16Array ],
  "uint16":   [ PLY_TYPES.INT, 2, Uint16Array ],
  "int":      [ PLY_TYPES.INT, 4, Int32Array ],
  "int32":    [ PLY_TYPES.INT, 4, Int32Array ],
  "uint":     [ PLY_TYPES.INT, 4, Uint32Array ],
  "uint32":   [ PLY_TYPES.INT, 4, Uint32Array ],
  "float":    [ PLY_TYPES.FLOAT, 4, Float32Array ],
  "float32":  [ PLY_TYPES.FLOAT, 4, Float32Array ],
  "double":   [ PLY_TYPES.FLOAT, 8, Float64Array ],
  "float64":  [ PLY_TYPES.FLOAT, 8, Float64Array ]
};

const SYSTEM_ENDIAN = isLittleEndian ?
  PLY_FORMAT.BINARY_LITTLE_ENDIAN :
  PLY_FORMAT.BINARY_BIG_ENDIAN;

class PLYProperty {
  constructor(name, data, type, size0, size1) {
    this.name = name;
    this.data = data;
    this.type = type;
    this.size0 = size0;
    this.size1 = size1;
  }
}

class PLYElement {
  constructor(name, count) {
    this.name = name;
    this.count = count;
    this.properties = [];
  }
}

const data_buffer = new Uint8Array(8);
const float_view = new Float32Array(data_buffer.buffer);
const double_view = new Float64Array(data_buffer.buffer);

const TRAIL_EOL = new Buffer(1);
TRAIL_EOL[0] = 10;

export default class PLYParser {
  constructor() {
    this.onsuccess = () => {};
    this.onerror = () => {};
    this.state = PARSER_STATE.BEGIN;
    this.format = PLY_FORMAT.UNKNOWN;
    this.elements = [];
    this.offset = 0;
    this.buffers = [];
    this.current_element = 0;
    this.current_index = 0;
    this.current_line = 0;
    this.current_property = 0;
    this.current_list_property = -1;
    this.last_line = "";
  }

  getline(max_len) {
    var ptr = this.offset;
    var cbuf = 0;
    var n = 0;
    var prefix = null;
    while(n < max_len && cbuf < this.buffers.length) {
      if(this.buffers[cbuf][ptr] === 10) {
        this.current_line++;
        if(cbuf > 0) {
          prefix.push(this.buffers[cbuf].slice(0, ptr));
          this.offset = ptr+1;
          if(this.offset >= this.buffers[cbuf].length) {
            this.offset = 0;
            this.buffers.splice(0, cbuf+1);
          } else {
            this.buffers.splice(0, cbuf);
          }
          this.last_line = prefix.join('');
          return this.last_line;
        } else {
          this.last_line = this.buffers[0].slice(this.offset, ptr).toString();
          this.offset = ptr+1;
          if(this.offset >= this.buffers[cbuf].length) {
            this.offset = 0;
            this.buffers.shift();
          }
          return this.last_line;
        }
      }
      if(++ptr >= this.buffers[cbuf].length) {
        if(cbuf === 0) {
          prefix = [ this.buffers[0].slice(this.offset) ];
        }
        ++n;
        ++cbuf;
        ptr = 0;
      }
    }
    console.log(this.offset);
    if(n >= max_len) {
      return "!";
    }
    return null;
  }

  getchar() {
    if(this.buffers.length > 0) {
      var v = this.buffers[0][this.offset];
      this.offset++;
      if(this.offset > this.buffers[0].length) {
        this.offset = 0;
        this.buffers.shift();
      }
      return v;
    }
    return -1;
  }

  getint(len) {
    for(var i=0; i<len; ++i) {
      var v = this.getchar();
      if(v < 0) {
        return Number.NaN;
      }
      data_buffer[i] = v;
    }
    var r = 0;
    if(this.format === PLY_FORMAT.BINARY_LITTLE_ENDIAN) {
      for(var j=0; j<len; ++j) {
        r += data_buffer[j] << (8*j);
      }
    } else {
      for(var j=0; j<len; ++j) {
        r += data_buffer[len-j-1] << (8*j);
      }
    }
    return r;
  }

  getfloat(len) {
    for(var i=0; i<len; ++i) {
      var v = this.getchar();
      if(v < 0) {
        return Number.NaN;
      }
      data_buffer[i] = v;
    }
    if(this.format !== SYSTEM_ENDIAN) {
      for(var i=0; i<len; ++i) {
        var t = data_buffer[i];
        data_buffer[i] = data_buffer[len-i-1];
        data_buffer[len-i-1] = t;
      }
    }
    if(len === 4) {
      return float_view[0];
    } else {
      return double_view[0];
    }
  }

  clearBuffers() {
    this.offset = 0;
    this.buffers = [];
  }

  raiseError(message) {
    if(this.state !== PARSER_STATE.ERROR) {
      this.state = PARSER_STATE.ERROR;
      if(this.current_line > 0) {
        this.onerror(new Error("Error parsing PLY: " + message + " on line " + this.current_line + "\n\t'" + this.last_line + "'"));
      } else {
        this.onerror(new Error("Error parsing PLY: " + message));
      }
      this.clearBuffers();
    }
  }

  createResult() {
    var result = {};
    for(var i=0; i<this.elements.length; ++i) {
      var element = this.elements[i];
      var props = {};
      for(var j=0; j<element.properties.length; ++j) {
        var prop = element.properties[j];
        props[prop.name] = prop.data;
      }
      result[element.name] = props;
    }
    return result;
  }

  processBinary() {
    while(this.current_element < this.elements.length) {
      var c = this.elements[this.current_element];
      var props = c.properties;
      while(this.current_index < c.count) {
        var idx = this.current_index;
        while(this.current_property < props.length) {
          var p = props[this.current_property++];
          switch(p.type) {
            case PLY_TYPES.INT:
              var vi = this.getint(p.size0);
              if(isNaN(vi)) {
                this.raiseError("Invalid integer value");
                return false;
              }
              p.data[idx] = vi;
            break;

            case PLY_TYPES.FLOAT:
              var vf = this.getfloat(p.size0);
              if(isNaN(vf)) {
                this.raiseError("Invalid float value");
                return false;
              }
              p.data[idx] = vf;
            break;

            case PLY_TYPES.LIST_INT:
            case PLY_TYPES.LIST_FLOAT:
              var lst;
              if(this.current_list_property < 0) {
                var vi = this.getint(p.size0);
                if(isNaN(vi)) {
                  this.raiseError("Invalid list length");
                  return false;
                }
                lst = new Array(vi);
                p.data[idx] = lst;
                this.current_list_property = 0;
              } else {
                lst = p.data[idx];
              }
              while(this.current_list_property < lst.length) {
                var v;
                if(p.type === PLY_TYPES.LIST_INT) {
                  v = this.getint(p.size1);
                } else {
                  v = this.getfloat(p.size1);
                }
                if(isNaN(v)) {
                  this.raiseError("Invalid value in list");
                  return false;
                }
                lst[this.current_list_property++] = v;
              }
              this.current_list_property = -1;
            break;

            default:
              this.raiseError("Uninitialized property type (this should never happen)");
              return false;
          }
        }

        this.current_property = 0;
        this.current_index += 1;
      }
      this.current_index = 0;
      this.current_element++;
    }
    this.state = PARSER_STATE.DONE;
    return true;
  }

  processAscii() {
    while(this.current_element < this.elements.length) {
      var c = this.elements[this.current_element];
      var props = c.properties;
      while(this.current_index < c.count) {
        var l = this.getline(1<<20);
        if(!l) {
          return false;
        }
        var idx = this.current_index;
        var toks = l.split(" ");
        var c_tok = 0;
        for(var i=0; i<props.length; ++i) {
          if(c_tok >= toks.length) {
            this.raiseError("Not enough values for element");
            return false;
          }
          var p = props[i];
          switch(p.type) {
            case PLY_TYPES.INT:
              var vi = parseInt(toks[c_tok++], 10);
              if(isNaN(vi)) {
                this.raiseError("Invalid integer value");
                return false;
              }
              p.data[idx] = vi;
            break;

            case PLY_TYPES.FLOAT:
              var vf = parseFloat(toks[c_tok++]);
              if(isNaN(vf)) {
                this.raiseError("Invalid float value");
                return false;
              }
              p.data[idx] = vf;
            break;

            case PLY_TYPES.LIST_INT:
            case PLY_TYPES.LIST_FLOAT:
              var vi = parseInt(toks[c_tok++]);
              if(isNaN(vi) || vi < 0) {
                this.raiseError("Invalid list length");
                return false
              }
              if(vi + c_tok > toks.length) {
                this.raiseError("List length too long");
                return false;
              }
              var result = new Array(vi);
              p.data[idx] = result;
              if(p.type === PLY_TYPES.LIST_INT) {
                for(var j=0; j<vi; ++j) {
                  result[j] = parseInt(toks[c_tok++], 10);
                  if(isNaN(result[j])) {
                    this.raiseError("Invalid integer in list");
                    return false;
                  }
                }
              } else {
                for(var j=0; j<vi; ++j) {
                  result[j] = parseFloat(toks[c_tok++]);
                  if(isNaN(result[j])) {
                    this.raiseError("Invalid float in list");
                    return false;
                  }
                }
              }
            break;

            default:
              this.raiseError("Uninitialized property type (this should never happen)");
              return false;
          }
        }
        this.current_index += 1;
      }
      this.current_index = 0;
      this.current_element++;
    }
    this.state = PARSER_STATE.DONE;
    return true;
  }

  processProperty(name, type) {
    var sz = this.elements[this.elements.length-1].count;
    if(type[0] === "list") {
      if(type.length !== 3) {
        this.raiseError("Invalid list datatype");
        return null;
      }
      var t0 = PLY_TYPENAMES[type[1]];
      var t1 = PLY_TYPENAMES[type[2]];
      if(!t0 || t0[0] !== PLY_TYPES.INT) {
        this.raiseError("List length must be an integer");
        return null;
      }
      if(!t1) {
        this.raiseError("Invalid type for list values");
        return null;
      }
      return new PLYProperty(name, new Array(sz), t1[0] + PLY_TYPES.LIST, t0[1], t1[1]);
    }
    var t = PLY_TYPENAMES[type[0]];
    if(!t) {
      this.raiseError("Invalid property datatype");
      return null;
    }
    var typecons = t[2];
    return new PLYProperty(name, new typecons(sz), t[0], t[1], 0);
  }

  processToken() {
    switch(this.state) {
      case PARSER_STATE.BEGIN:
        var l = this.getline(4);
        if(!l) {
          return false;
        }
        if(l === "ply") {
          this.state = PARSER_STATE.FORMAT;
          return true;
        } else {
          this.raiseError("Missing/invalid PLY magic number");
          return false;
        }
      break;

      case PARSER_STATE.FORMAT:
        var l = this.getline(64);
        if(!l) {
          return false;
        }
        var toks = l.split(" ");
        if(toks.length > 0 && toks[0] === "comment") {
          return true;
        }
        if(toks.length !== 3 || toks[0] !== "format" || toks[2] !== "1.0") {
          this.raiseError("Missing/invalid format specifier");
          return false;
        }
        switch(toks[1]) {
          case "ascii":
            this.format = PLY_FORMAT.ASCII;
          break;

          case "binary_little_endian":
            this.format = PLY_FORMAT.BINARY_LITTLE_ENDIAN;
          break;

          case "binary_big_endian":
            this.format = PLY_FORMAT.BINARY_BIG_ENDIAN;
          break;

          default:
            this.raiseError("Invalid format");
            return false;
          break;
        }
        this.state = PARSER_STATE.HEADER;
        return true;
      break;

      case PARSER_STATE.HEADER:
        var l = this.getline(4096);
        if(!l) {
          return false;
        }
        var toks = l.split(" ");
        switch(toks[0]) {
          case "element":
            if(toks.length !== 3) {
              this.raiseError("Invalid element description");
              return false;
            }
            var count = parseInt(toks[2], 10);
            if(isNaN(count) || count < 0) {
              this.raiseError("Invalid element count");
              return false;
            }
            this.elements.push(new PLYElement(toks[1], count));
            return true;
          break;

          case "property":
            if(this.elements.length === 0) {
              this.raiseError("Got a property without an element");
              return false;
            }
            if(toks.length < 3) {
              this.raiseError("Invalid property description");
              return false;
            }
            var prop = this.processProperty(toks[toks.length-1], toks.slice(1, toks.length-1));
            if(!prop) {
              return false;
            }
            this.elements[this.elements.length-1].properties.push(prop);
            return true;
          break;

          case "end_header":
            this.current_index = 0;
            this.current_element = 0;
            this.state = PARSER_STATE.BODY;
            if(this.format !== PLY_FORMAT.ASCII) {
              this.current_line = -1;
            }
            return true;
          break;

          case "comment":
            return true;
          break;

          default:
            this.raiseError("Unexpeceted token in header");
            return false;
        }
      break;

      case PARSER_STATE.BODY:
        switch(this.format) {
          case PLY_FORMAT.ASCII:
            return this.processAscii();
          case PLY_FORMAT.BINARY_LITTLE_ENDIAN:
          case PLY_FORMAT.BINARY_BIG_ENDIAN:
            return this.processBinary();
          default:
            this.raiseError("Invalid format, this should not happen");
            return false;
        }
      break;

      case PARSER_STATE.DONE:
        this.clearBuffers();
        return false;
      break;

      case PARSER_STATE.ERROR:
        this.clearBuffers();
        return false;
      break;

      default:
        this.raiseError("Parser state corrupted");
        return false;
    }
    return false;
  }

  ondata(data) {
    if(this.state === PARSER_STATE.ERROR) {
      return;
    }
    if(data instanceof Buffer) {
      this.buffers.push(data);
    } else {
      this.buffers.push(new Buffer(data));
    }
    while(this.processToken()) { }
  }

  onend() {
    this.ondata(TRAIL_EOL);
    this.clearBuffers();
    if(this.state === PARSER_STATE.DONE) {
      this.onsuccess(this.createResult());
    } else if(this.state !== PARSER_STATE.ERROR) {
      this.raiseError("Unexpected EOF while parsing PLY file");
    }
  }

  parse(buffer) {
    this.ondata(buffer);
    this.onend();
  }
}
