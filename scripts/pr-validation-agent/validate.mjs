import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

// Errors that appear in headless Chromium but are not real failures.
const BENIGN_PATTERNS = [
  'WEBGL_debug_renderer_info',        // Extension not available in headless
  'GL_EXT_disjoint_timer_query',      // Timer extension absent in headless
  'EXT_color_buffer_float',           // Not always available
  'OES_texture_float_linear',         // Capability check, not an error
];

function isBenign(msg) {
  return BENIGN_PATTERNS.some(p => msg.includes(p));
}

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
      screenshotName: null,
    };

    try {
      const ctx = await browser.newContext({
        viewport: {width: 1280, height: 720},
      });
      const page = await ctx.newPage();

      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' && !isBenign(text)) result.errors.push(text);
        if (msg.type() === 'warning' && !isBenign(text)) result.warnings.push(text);
      });
      page.on('pageerror', err => result.errors.push(`Uncaught: ${err.message}`));

      const filePath = join(outputDir, ex.filename);
      await page.goto(`file://${filePath}`, {timeout: 15_000});

      // Give deck.gl time to initialize WebGL context and complete the first render.
      // deck.gl fires onAfterRender on first frame; 4s covers slow CI environments.
      await page.waitForTimeout(4000);

      result.hasCanvas = (await page.$('canvas')) !== null;
      result.passed = result.hasCanvas && result.errors.length === 0;

      const screenshotName = `${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      await page.screenshot({
        path: join(screenshotsDir, screenshotName),
        fullPage: false,
      });
      result.screenshotName = screenshotName;

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
