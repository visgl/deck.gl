const data = [
  {
    color: [180, 50, 0],
    position: [0, 0, 0]
  },
  {
    color: [205, 150, 0],
    position: [0, 5, 0]
  },
  {
    color: [75, 125, 0],
    position: [5, 5, 0]
  },
  {
    color: [0, 205, 150],
    position: [5, 10, 0]
  },
  {
    color: [0, 125, 180],
    position: [10, 10, 0]
  },
  {
    color: [150, 0, 205],
    position: [10, 15, 0]
  },
  {
    color: [205, 0, 150],
    position: [15, 15, 0]
  }
];

/* Interleaved buffer layout:

  | attribute  | size     |
  | ---------- | -------- |
  | color.R    | 1 byte   |
  | color.G    | 1 byte   |
  | color.B    | 1 byte   |
  | color.A    | 1 byte   |
  | position.x | 1 float  |
  | position.y | 1 float  |
  | position.z | 1 float  |
  | ---------- | -------- |
  | total      | 16 bytes |

 */
const bytesPerDatum = 16;
const arraybuffer = new ArrayBuffer(data.length * bytesPerDatum);
const view = new DataView(arraybuffer);

for (let i = 0; i < data.length; i++) {
  const {color, position} = data[i];
  const offset = i * bytesPerDatum;

  view.setUint8(offset + 0, color[0]);
  view.setUint8(offset + 1, color[1]);
  view.setUint8(offset + 2, color[2]);
  view.setUint8(offset + 3, 255);
  // WebGL expects little endian
  view.setFloat32(offset + 4, position[0], true);
  view.setFloat32(offset + 8, position[1], true);
  view.setFloat32(offset + 12, position[2], true);
}

export default new Float32Array(arraybuffer);
