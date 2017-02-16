import fs from 'fs';
import path from 'path';

export const lighting = {
  interface: 'lighting',
  source: fs.readFileSync(path.join(__dirname, 'lighting.glsl'), 'utf8')
};
