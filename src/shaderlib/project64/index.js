import fs from 'fs';
import path from 'path';
export default {
  project64: {
    interface: 'project64',
    source: fs.readFileSync(path.join(__dirname, '/project64.glsl'), 'utf8')
  }
};
