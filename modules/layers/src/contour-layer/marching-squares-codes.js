// Code to Offsets Map needed to implement Marching Squres algorithm
// Ref: https://en.wikipedia.org/wiki/Marching_squares

// Table to map code to the intersection offsets
// All offsets are relative to the center of marching cell (which is top right corner of grid-cell, and center of marching-square)
const HALF = 0.5;
const ONE6TH = 1 / 6;
const OFFSET = {
  N: [0, HALF], // NORTH
  E: [HALF, 0], // EAST
  S: [0, -HALF], // SOUTH
  W: [-HALF, 0], // WEST

  // CORNERS
  NE: [HALF, HALF],
  NW: [-HALF, HALF],
  SE: [HALF, -HALF],
  SW: [-HALF, -HALF]
};

// NOTE: vertices are ordered in CCW direction, starting from NW corner

// Triangles
const SW_TRIANGLE = [OFFSET.W, OFFSET.SW, OFFSET.S];
const SE_TRIANGLE = [OFFSET.S, OFFSET.SE, OFFSET.E];
const NE_TRIANGLE = [OFFSET.E, OFFSET.NE, OFFSET.N];
const NW_TRIANGLE = [OFFSET.NW, OFFSET.W, OFFSET.N];

// Trapezoids
const SW_TRAPEZOID = [[-HALF, ONE6TH], [-HALF, -ONE6TH], [-ONE6TH, -HALF], [ONE6TH, -HALF]];
const SE_TRAPEZOID = [[-ONE6TH, -HALF], [ONE6TH, -HALF], [HALF, -ONE6TH], [HALF, ONE6TH]];
const NE_TRAPEZOID = [[HALF, -ONE6TH], [HALF, ONE6TH], [ONE6TH, HALF], [-ONE6TH, HALF]];
const NW_TRAPEZOID = [[-HALF, ONE6TH], [-HALF, -ONE6TH], [ONE6TH, HALF], [-ONE6TH, HALF]];

// Rectangles
const S_RECTANGLE = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E];
const E_RECTANGLE = [OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
const N_RECTANGLE = [OFFSET.NW, OFFSET.W, OFFSET.E, OFFSET.NE];
const W_RECTANGLE = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.N];
const EW_RECTANGEL = [[-HALF, ONE6TH], [-HALF, -ONE6TH], [HALF, -ONE6TH], [HALF, ONE6TH]];
const SN_RECTANGEL = [[-ONE6TH, -HALF], [ONE6TH, -HALF], [ONE6TH, HALF], [-ONE6TH, HALF]];

// Square
const SQUARE = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.NE];

// Pentagons
const SW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.E, OFFSET.N];
const SE_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.NE, OFFSET.N];
const NE_PENTAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.NE];
const NW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE];

const NW_N_PENTAGON = [OFFSET.NW, OFFSET.W, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
const NE_E_PENTAGON = [[-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE, OFFSET.N];
const SE_S_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.E];
const SW_W_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [ONE6TH, HALF], [-ONE6TH, HALF]];

const NW_W_PENTAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.N];
const NE_N_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.E, OFFSET.NE, OFFSET.N];
const SE_E_PENTAGON = [OFFSET.S, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
const SW_S_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH]];

// Hexagon
const S_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
const E_HEXAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
const N_HEXAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE];
const W_HEXAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
const SW_NE_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE, OFFSET.N];
const NW_SE_HEXAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.E, OFFSET.N];

// Heptagon (7-sided)
const NE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  OFFSET.E,
  OFFSET.NE,
  OFFSET.N
];
const SW_HEPTAGON = [
  OFFSET.W,
  OFFSET.SW,
  OFFSET.S,
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
const NW_HEPTAGON = [
  OFFSET.NW,
  OFFSET.W,
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  OFFSET.N
];
const SE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  OFFSET.S,
  OFFSET.SE,
  OFFSET.E,
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];

// Octagon
const OCTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];

// Note: above wiki page invertes white/black dots for generating the code, we don't
export const ISOLINES_CODE_OFFSET_MAP = {
  // key is equal to the code of 4 vertices (invert the code specified in wiki)
  // value can be an array or an Object
  // Array : [line] or [line, line], where each line is [start-point, end-point], and each point is [x, y]
  // Object : to handle saddle cases, whos output depends on mean value of all 4 corners
  //  key: code of mean value (0 or 1)
  //  value: Array , as above defines one or two line segments
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: {
    0: [[OFFSET.W, OFFSET.S], [OFFSET.N, OFFSET.E]],
    1: [[OFFSET.W, OFFSET.N], [OFFSET.S, OFFSET.E]]
  },
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: {
    0: [[OFFSET.W, OFFSET.N], [OFFSET.S, OFFSET.E]],
    1: [[OFFSET.W, OFFSET.S], [OFFSET.N, OFFSET.E]]
  },
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};

export const ISOBANDS_CODE_OFFSET_MAP = {
  // Below list of cases, follow the same order as in above mentioned wiki page.
  // Each case has its code on first commented line // T,TR,R,C
  // where T: Top, TR: Top-right, R: Right and C: current, each will be either 0, 1 or 2
  // final code is binary represenation of above code , where takes 2 digits
  // for example:  code 2-2-2-1 => 10-10-10-01 => 10101001 => 169

  // no contours

  // 0000
  0: [],
  // 2222
  170: [],

  // single triangle

  // 2221
  169: [SW_TRIANGLE],
  // 2212
  166: [SE_TRIANGLE],
  // 2122
  154: [NE_TRIANGLE],
  // 1222
  106: [NW_TRIANGLE],
  // 0001
  1: [SW_TRIANGLE],
  // 0010
  4: [SE_TRIANGLE],
  // 0100
  16: [NE_TRIANGLE],
  // 1000
  64: [NW_TRIANGLE],

  // single trapezoid
  // 2220
  168: [SW_TRAPEZOID],
  // 2202
  162: [SE_TRAPEZOID],
  // 2022
  138: [NE_TRAPEZOID],
  // 0222
  42: [NW_TRAPEZOID],
  // 0002
  2: [SW_TRAPEZOID],
  // 0020
  8: [SE_TRAPEZOID],
  // 0200
  32: [NE_TRAPEZOID],
  // 2000
  128: [NW_TRAPEZOID],

  // single rectangle
  // 0011
  5: [S_RECTANGLE],
  // 0110
  20: [E_RECTANGLE],
  // 1100
  80: [N_RECTANGLE],
  // 1001
  65: [W_RECTANGLE],
  // 2211
  165: [S_RECTANGLE],
  // 2112
  150: [E_RECTANGLE],
  // 1122
  90: [N_RECTANGLE],
  // 1221
  105: [W_RECTANGLE],
  // 2200
  160: [EW_RECTANGEL],
  // 2002
  130: [SN_RECTANGEL],
  // 0022
  10: [EW_RECTANGEL],
  // 0220
  40: [SN_RECTANGEL],

  // single square
  // 1111
  85: [SQUARE],

  // single pentagon
  // 1211
  101: [SW_PENTAGON],

  // 2111
  149: [SE_PENTAGON],

  // 1112
  86: [NE_PENTAGON],

  // 1121
  89: [NW_PENTAGON],

  // 1011
  69: [SW_PENTAGON],

  // 0111
  21: [SE_PENTAGON],

  // 1110
  84: [NE_PENTAGON],

  // 1101
  81: [NW_PENTAGON],

  // 1200
  96: [NW_N_PENTAGON],

  // 0120
  24: [NE_E_PENTAGON],

  // 0012
  6: [SE_S_PENTAGON],

  // 2001
  129: [SW_W_PENTAGON],

  // 1022
  74: [NW_N_PENTAGON],

  // 2102
  146: [NE_E_PENTAGON],

  // 2210
  164: [SE_S_PENTAGON],

  // 0221
  41: [SW_W_PENTAGON],

  // 1002
  66: [NW_W_PENTAGON],

  // 2100
  144: [NE_N_PENTAGON],

  // 0210
  36: [SE_E_PENTAGON],

  // 0021
  9: [SW_S_PENTAGON],

  // 1220
  104: [NW_W_PENTAGON],

  // 0122
  26: [NE_N_PENTAGON],

  // 2012
  134: [SE_E_PENTAGON],

  // 2201
  161: [SW_S_PENTAGON],

  // single hexagon
  // 0211
  37: [S_HEXAGON],

  // 2110
  148: [E_HEXAGON],

  // 1102
  82: [N_HEXAGON],

  // 1021
  73: [W_HEXAGON],

  // 2011
  133: [S_HEXAGON],

  // 0112
  22: [E_HEXAGON],

  // 1120
  88: [N_HEXAGON],

  // 1201
  97: [W_HEXAGON],

  // 2101
  145: [SW_NE_HEXAGON],

  // 0121
  25: [SW_NE_HEXAGON],

  // 1012
  70: [NW_SE_HEXAGON],

  // 1210
  100: [NW_SE_HEXAGON],

  // 6-sided polygons based on mean weight
  // NOTE: merges mean value codes for extreme changes (as per above Wiki doc)
  // 0101
  17: {
    0: [SW_TRIANGLE, NE_TRIANGLE],
    1: [SW_NE_HEXAGON],
    2: [SW_NE_HEXAGON]
  },

  // 1010
  68: {
    0: [NW_TRIANGLE, SE_TRIANGLE],
    1: [NW_SE_HEXAGON],
    2: [NW_SE_HEXAGON]
  },

  // 2121
  153: {
    0: [SW_NE_HEXAGON],
    1: [SW_NE_HEXAGON],
    2: [SW_TRIANGLE, NE_TRIANGLE]
  },

  // 1212
  102: {
    0: [NW_SE_HEXAGON],
    1: [NW_SE_HEXAGON],
    2: [NW_TRIANGLE, SE_TRIANGLE]
  },

  // 7-sided polygons based on mean weight
  // 2120
  152: {
    0: [NE_HEPTAGON],
    1: [NE_HEPTAGON],
    2: [SW_TRAPEZOID, NE_TRIANGLE]
  },

  // 2021
  137: {
    0: [SW_HEPTAGON],
    1: [SW_HEPTAGON],
    2: [SW_TRIANGLE, NE_TRAPEZOID]
  },

  // 1202
  98: {
    0: [NW_HEPTAGON],
    1: [NW_HEPTAGON],
    2: [NW_TRIANGLE, SE_TRAPEZOID]
  },

  // 0212
  38: {
    0: [SE_HEPTAGON],
    1: [SE_HEPTAGON],
    2: [SE_TRIANGLE, NW_TRAPEZOID]
  },

  // 0102
  18: {
    0: [SW_TRAPEZOID, NE_TRIANGLE],
    1: [NE_HEPTAGON],
    2: [NE_HEPTAGON]
  },

  // 0201
  33: {
    0: [SW_TRIANGLE, NE_TRAPEZOID],
    1: [SW_HEPTAGON],
    2: [SW_HEPTAGON]
  },

  // 1020
  72: {
    0: [NW_TRIANGLE, SE_TRAPEZOID],
    1: [NW_HEPTAGON],
    2: [NW_HEPTAGON]
  },

  // 2010
  132: {
    0: [SE_TRIANGLE, NW_TRAPEZOID],
    1: [SE_HEPTAGON],
    2: [SE_HEPTAGON]
  },

  // 8-sided polygons based on mean weight
  // 2020
  136: {
    0: [NW_TRAPEZOID, SE_TRAPEZOID],
    1: [OCTAGON],
    2: [SW_TRAPEZOID, NE_TRAPEZOID]
  },

  // 0202
  34: {
    0: [NE_TRAPEZOID, SW_TRAPEZOID],
    1: [OCTAGON],
    2: [NW_TRAPEZOID, SE_TRAPEZOID]
  }
};
