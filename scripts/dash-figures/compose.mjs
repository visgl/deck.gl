#!/usr/bin/env node
//
// Assembles the dash figures used by docs/api-reference/extensions/path-style-extension.md
// from render-test golden images.
//
// "After" panels are read straight out of test/render/golden-images, so a published figure
// cannot drift away from what the code does - if behavior changes, the golden test fails
// before the figure goes stale. "Before" panels come from scripts/dash-figures/capture-before.sh,
// which re-renders the same scenes against the pre-9.4 implementation.
//
// Usage:
//   node scripts/dash-figures/compose.mjs [--before <dir>] [--out <dir>]

import fileSystem from 'node:fs';
import nodePath from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const REPOSITORY_ROOT = nodePath.resolve(import.meta.dirname, '../..');
const GOLDEN_DIRECTORY = nodePath.join(REPOSITORY_ROOT, 'test/render/golden-images');

const PANEL_WIDTH = 800;
const PADDING = 16;
const CAPTION_HEIGHT = 34;
const SUBCAPTION_HEIGHT = 26;
const BACKGROUND = {r: 255, g: 255, b: 255, alpha: 1};

function parseArguments(commandLineArguments) {
  const options = {
    beforeDirectory: nodePath.join(REPOSITORY_ROOT, '.dash-figures/before'),
    // Writes straight into the tracked location, so the committed figures are this
    // pipeline's real output rather than a copy that can drift from it.
    outputDirectory: nodePath.join(REPOSITORY_ROOT, 'docs/images/path-style')
  };
  for (let argumentIndex = 0; argumentIndex < commandLineArguments.length; argumentIndex += 2) {
    if (commandLineArguments[argumentIndex] === '--before') {
      options.beforeDirectory = nodePath.resolve(commandLineArguments[argumentIndex + 1]);
    } else if (commandLineArguments[argumentIndex] === '--out') {
      options.outputDirectory = nodePath.resolve(commandLineArguments[argumentIndex + 1]);
    }
  }
  return options;
}

function escapeXml(text) {
  return text.replace(
    /[<>&]/g,
    character => ({'<': '&lt;', '>': '&gt;', '&': '&amp;'})[character]
  );
}

/** A caption strip. `tone` picks the accent colour used for before/after labelling. */
function createCaption(
  text,
  {height = CAPTION_HEIGHT, size = 15, weight = 600, tone = '#1a1a1a'} = {}
) {
  const svgMarkup = `<svg width="${PANEL_WIDTH}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${PANEL_WIDTH}" height="${height}" fill="#ffffff"/>
    <text x="${PADDING}" y="${height - Math.round(height / 3)}"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="${size}" font-weight="${weight}" fill="${tone}">${escapeXml(text)}</text>
  </svg>`;
  return sharp(Buffer.from(svgMarkup)).png().toBuffer();
}

const MAX_INTERNAL_GAP = 26;

/**
 * Collapses runs of blank scanlines down to `maxGap`.
 *
 * Trimming alone only removes whitespace at the edges. These panels lay their content out as
 * widely spaced rows, so a trimmed panel is still mostly empty in the middle and the stacked
 * figure ends up several thousand pixels tall for a few hundred pixels of content. Squeezing
 * the interior keeps the rows in their original order and relative grouping while making the
 * figure readable at a glance.
 */
function squeezeBlankRows({data, info: imageInfo}) {
  const {width, height, channels} = imageInfo;
  const rowIsBlank = [];
  for (let verticalIndex = 0; verticalIndex < height; verticalIndex++) {
    let isBlank = true;
    for (let horizontalIndex = 0; horizontalIndex < width; horizontalIndex++) {
      const pixelOffset = (verticalIndex * width + horizontalIndex) * channels;
      // Panels are flattened onto white before this runs.
      if (
        data[pixelOffset] < 250 ||
        data[pixelOffset + 1] < 250 ||
        data[pixelOffset + 2] < 250
      ) {
        isBlank = false;
        break;
      }
    }
    rowIsBlank.push(isBlank);
  }

  const rowsToKeep = [];
  let gapLength = 0;
  for (let verticalIndex = 0; verticalIndex < height; verticalIndex++) {
    if (rowIsBlank[verticalIndex]) {
      gapLength++;
      if (gapLength <= MAX_INTERNAL_GAP) rowsToKeep.push(verticalIndex);
    } else {
      gapLength = 0;
      rowsToKeep.push(verticalIndex);
    }
  }

  const outputBuffer = Buffer.alloc(rowsToKeep.length * width * channels);
  rowsToKeep.forEach((verticalIndex, outputIndex) => {
    data.copy(
      outputBuffer,
      outputIndex * width * channels,
      verticalIndex * width * channels,
      (verticalIndex + 1) * width * channels
    );
  });
  return {buffer: outputBuffer, width, height: rowsToKeep.length, channels};
}

/**
 * Trims a panel to its content box, squeezes its interior whitespace and re-pads it, so
 * figures are compact instead of mostly empty. Golden images are 800x450 with the strokes
 * occupying a few widely spaced bands.
 */
async function createPanel(filePath) {
  if (!fileSystem.existsSync(filePath)) {
    throw new Error(
      `Missing panel: ${filePath}\nRun scripts/dash-figures/capture-before.sh first.`
    );
  }
  const trimmedPanel = await sharp(filePath)
    .flatten({background: BACKGROUND})
    .trim({threshold: 5})
    .raw()
    .toBuffer({resolveWithObject: true});

  const squeezedPanel = squeezeBlankRows(trimmedPanel);

  return sharp(squeezedPanel.buffer, {
    raw: {
      width: squeezedPanel.width,
      height: squeezedPanel.height,
      channels: squeezedPanel.channels
    }
  })
    .resize({
      width: PANEL_WIDTH - PADDING * 2,
      fit: 'contain',
      position: 'left',
      background: BACKGROUND
    })
    .extend({
      top: PADDING / 2,
      bottom: PADDING / 2,
      left: PADDING,
      right: PADDING,
      background: BACKGROUND
    })
    .png()
    .toBuffer();
}

/** Stacks buffers vertically on a white background. */
async function stackBuffers(buffers) {
  const images = await Promise.all(
    buffers.map(async buffer => ({buffer, metadata: await sharp(buffer).metadata()}))
  );
  const height = images.reduce((total, {metadata}) => total + metadata.height, 0);

  let top = 0;
  const composites = images.map(({buffer, metadata}) => {
    const entry = {input: buffer, left: 0, top};
    top += metadata.height;
    return entry;
  });

  return sharp({
    create: {width: PANEL_WIDTH, height, channels: 4, background: BACKGROUND}
  })
    .composite(composites)
    .png()
    .toBuffer();
}

const getGoldenPath = name => nodePath.join(GOLDEN_DIRECTORY, `${name}.png`);

async function buildFigures(options) {
  const getBeforePath = name => nodePath.join(options.beforeDirectory, `${name}.png`);

  const figures = {
    'path-style-dash-modes': async () => [
      await createCaption('Dash modes, on one path whose segments are deliberately unequal'),
      await createCaption(
        'Ticks mark the joints. Rows: segment; segment + justified; path; path + justified.',
        {height: SUBCAPTION_HEIGHT, size: 13, weight: 400, tone: '#555555'}
      ),
      await createPanel(getGoldenPath('path-dash-figure-modes'))
    ],

    'path-style-dash-density': async () => [
      await createCaption('dashMode and vertex density'),
      await createCaption(
        'The same straight line drawn from 1, 2, 4, 12, 40 and 120 vertices, top to bottom.',
        {height: SUBCAPTION_HEIGHT, size: 13, weight: 400, tone: '#555555'}
      ),
      await createCaption("dashMode: 'segment' — the last two rows have no gaps left to draw", {
        height: SUBCAPTION_HEIGHT,
        size: 13,
        tone: '#b00000'
      }),
      await createPanel(getGoldenPath('path-dash-density-default')),
      await createCaption("dashMode: 'path' — all six rows identical", {
        height: SUBCAPTION_HEIGHT,
        size: 13,
        tone: '#006400'
      }),
      await createPanel(getGoldenPath('path-dash-density-mode-path'))
    ],

    'path-style-dash-units': async () => {
      const rows = [
        await createCaption('dashUnits, with widthUnits: ‘meters’ so the stroke itself scales'),
        await createCaption(
          "Top pair: dashUnits 'widths'. Bottom pair: dashUnits 'pixels'. Red is flat, blue is billboarded.",
          {height: SUBCAPTION_HEIGHT, size: 13, weight: 400, tone: '#555555'}
        )
      ];
      for (const zoom of [12, 13, 14]) {
        rows.push(
          await createCaption(`zoom ${zoom}`, {
            height: SUBCAPTION_HEIGHT,
            size: 13,
            tone: '#555555'
          })
        );
        rows.push(await createPanel(getGoldenPath(`path-dash-units-z${zoom}`)));
      }
      return rows;
    },

    'path-style-dash-fixes': async () => {
      const pairs = [
        [
          'path-dash-subpixel-square',
          'Sub-pixel dash periods',
          'Periods from 40px down to 0.2px. Every pattern is half solid, so each row should read as an even tone.'
        ],
        [
          'path-dash-billboard-map-z14',
          'billboard: true parity',
          'The same geometry drawn flat (red) and billboarded (blue). The two should match.'
        ],
        [
          'path-dash-3d-flat',
          'Paths that move in Z',
          'Four identical screen lines descending by 0, 300, 720 and 900 units. Spacing should stay even along each.'
        ]
        // getOffset is fixed too, and path-dash-offset-mode-path covers it, but it is left
        // out here on purpose: the drift it corrects is about 4% of a period (43.4px against
        // 41.6px at offset 8), which does not read in a figure. A pair that looks identical
        // on both sides would suggest the fix did nothing.
      ];

      const rows = [
        await createCaption('Fixed in v9.4 — no opt-in required'),
        await createCaption(
          'Each pair renders the identical scene; only the implementation differs.',
          {
            height: SUBCAPTION_HEIGHT,
            size: 13,
            weight: 400,
            tone: '#555555'
          }
        )
      ];
      for (const [name, title, blurb] of pairs) {
        rows.push(await createCaption(title));
        rows.push(
          await createCaption(blurb, {
            height: SUBCAPTION_HEIGHT,
            size: 13,
            weight: 400,
            tone: '#555555'
          })
        );
        rows.push(
          await createCaption('before', {
            height: SUBCAPTION_HEIGHT,
            size: 13,
            tone: '#b00000'
          })
        );
        rows.push(await createPanel(getBeforePath(name)));
        rows.push(
          await createCaption('after', {
            height: SUBCAPTION_HEIGHT,
            size: 13,
            tone: '#006400'
          })
        );
        rows.push(await createPanel(getGoldenPath(name)));
      }
      return rows;
    }
  };

  fileSystem.mkdirSync(options.outputDirectory, {recursive: true});
  for (const [figureName, buildRows] of Object.entries(figures)) {
    const imageBuffer = await stackBuffers(await buildRows());
    const targetPath = nodePath.join(options.outputDirectory, `${figureName}.png`);
    fileSystem.writeFileSync(targetPath, imageBuffer);
    const {width, height} = await sharp(targetPath).metadata();
    const {size} = fileSystem.statSync(targetPath);
    console.log(`${figureName}.png  ${width}x${height}  ${(size / 1024).toFixed(0)}KB`);
  }
}

buildFigures(parseArguments(process.argv.slice(2))).catch(error => {
  console.error(error.message);
  process.exit(1);
});
