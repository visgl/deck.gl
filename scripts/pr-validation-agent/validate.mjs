import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

const BENIGN_PATTERNS = [
  'WEBGL_debug_renderer_info',
  'GL_EXT_disjoint_timer_query',
  'EXT_color_buffer_float',
  'OES_texture_float_linear',
];

function isBenign(msg) {
  return BENIGN_PATTERNS.some(p => msg.includes(p));
}

// Four interactions that together reveal: render correctness, hover/tooltip
// behaviour, click/selection/picking, and viewport responsiveness.
// Each runs in sequence on the same live page — no reload between steps.
const INTERACTIONS = [
  {
    label: 'Initial render',
    slug: '1-initial',
    async perform() {},
  },
  {
    label: 'Hover',
    slug: '2-hover',
    async perform(page, {x, y, width, height}) {
      await page.mouse.move(x + width * 0.5, y + height * 0.5);
      await page.waitForTimeout(500);
    },
  },
  {
    label: 'Click',
    slug: '3-click',
    async perform(page, {x, y, width, height}) {
      await page.mouse.click(x + width * 0.5, y + height * 0.5);
      await page.waitForTimeout(500);
    },
  },
  {
    label: 'Zoom in',
    slug: '4-zoom',
    async perform(page, {x, y, width, height}) {
      // Wheel event at canvas centre — deck.gl's controller intercepts it
      await page.mouse.move(x + width * 0.5, y + height * 0.5);
      await page.mouse.wheel(0, -500);
      await page.waitForTimeout(800);
    },
  },
];

export async function validateExamples({examples}) {
  const outputDir = join(__dir, 'output');
  const screenshotsDir = join(outputDir, 'screenshots');
  await mkdir(screenshotsDir, {recursive: true});

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl'],
  });

  const results = [];

  for (const ex of examples) {
    console.log(`  Checking ${ex.filename}...`);
    const result = {
      name: ex.name,
      filename: ex.filename,
      passed: false,
      errors: [],
      warnings: [],
      hasCanvas: false,
      screenshots: [], // [{label, slug, filename}]
    };

    try {
      const ctx = await browser.newContext({viewport: {width: 1280, height: 720}});
      const page = await ctx.newPage();

      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' && !isBenign(text)) result.errors.push(text);
        if (msg.type() === 'warning' && !isBenign(text)) result.warnings.push(text);
      });
      page.on('pageerror', err => result.errors.push(`Uncaught: ${err.message}`));

      await page.goto(`file://${join(outputDir, ex.filename)}`, {timeout: 15_000});
      await page.waitForTimeout(4000);

      result.hasCanvas = (await page.$('canvas')) !== null;
      result.passed = result.hasCanvas && result.errors.length === 0;

      if (result.hasCanvas) {
        const canvas = await page.$('canvas');
        const box = await canvas.boundingBox();
        const slug = ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        for (const step of INTERACTIONS) {
          await step.perform(page, box);
          const filename = `${slug}-${step.slug}.png`;
          await page.screenshot({path: join(screenshotsDir, filename), fullPage: false});
          result.screenshots.push({label: step.label, slug: step.slug, filename});
        }
        console.log(`    captured ${result.screenshots.length} screenshots`);
      }

      await ctx.close();
    } catch (err) {
      result.errors.push(`Playwright: ${err.message}`);
    }

    console.log(`    ${result.passed ? '✓ pass' : '✗ fail'} — canvas:${result.hasCanvas} errors:${result.errors.length}`);
    results.push(result);
  }

  await browser.close();
  return results;
}
