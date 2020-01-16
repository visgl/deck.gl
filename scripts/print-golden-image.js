/*
  Script to retrieve failed screenshot from CI
    - In render test, enable `saveOnFail`
    - node scripts/print-golden-image.js <image_name> <sx> <sy> <width> <height>
    - Copy the printed base64 string
    - Use `restore` function in this file to convert string back to image
 */
const {PNG} = require('pngjs');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.resolve('./test/render/golden-images', process.argv[2]);
const OUTPUT_FILE = 'out.png';

const SOURCE_X = Number(process.argv[3]) || 0;
const SOURCE_Y = Number(process.argv[4]) || 0;
const WIDTH = Number(process.argv[5]) || 800;
const HEIGHT = Number(process.argv[6]) || 450;

fs.createReadStream(INPUT_FILE)
  .pipe(new PNG())
  .on('parsed', function() {
    const dst = new PNG({width: WIDTH, height: HEIGHT});
    // copy to destination
    this.bitblt(dst, SOURCE_X, SOURCE_Y, WIDTH, HEIGHT, 0, 0);

    dst.pack().pipe(fs.createWriteStream('out.png'))
      .on('close', function() {
        const buffer = fs.readFileSync('out.png');
        console.log(buffer.toString('base64'));
      });
  });

// Call to convert base64 back to file
function restore(base64, width, height) {
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync('out.png', buffer);
}
