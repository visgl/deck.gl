import Anthropic from '@anthropic-ai/sdk';
import {mkdir, writeFile} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const client = new Anthropic();
const __dir = dirname(fileURLToPath(import.meta.url));

// Sonnet is used here — it writes better code than Haiku, and generation
// is a one-shot call so the cost is still very low (~$0.01–0.02 per PR run).
const SYSTEM = `You generate self-contained HTML validation examples for deck.gl pull requests.
A human maintainer and an automated Playwright check will both review your output.

## Format
- Each example is ONE complete, immediately-runnable HTML file
- CDN: <script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
- For basemaps add MapLibre: https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.js
  and stylesheet: https://unpkg.com/maplibre-gl@3.6.0/dist/maplibre-gl.css
  Use mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
- Access deck.gl via the global object: const {DeckGL, ArcLayer} = deck;
- NO fetch() calls, NO external data — use small inline hardcoded arrays (5–20 features)
- NO TypeScript, NO bundlers, NO npm imports

## Visuals
- body { margin: 0; background: #1a1a2e; }
- #container { width: 100vw; height: 100vh; position: relative; }
- Title overlay: position: absolute, top: 10px, left: 10px, white text, semi-transparent background
- Title must clearly say what is being tested, e.g. "ArcLayer — outlineWidth prop"
- First line of the file must be an HTML comment: <!-- PR Validation: [what this tests] -->

## Data conventions
- Positions as [longitude, latitude]
- Default viewport: { longitude: -100, latitude: 40.7, zoom: 3 } (continental USA)
- City scale: { longitude: -122.45, latitude: 37.75, zoom: 11 } (San Francisco)
- Color arrays as [R, G, B] or [R, G, B, A]

## Content
- First example: directly demonstrate the new or changed prop/layer/widget
- Additional examples (if any): exercise regression risks from the analysis
- Be minimal — prove the feature works, not a full showcase
- If a prop accepts a function accessor, show both constant and function forms`;

const EXAMPLES_SCHEMA = {
  type: 'object',
  required: ['examples'],
  properties: {
    examples: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'description', 'focusArea', 'html'],
        properties: {
          name: {
            type: 'string',
            description: 'kebab-case identifier, e.g. "arc-outline-width"',
          },
          description: {
            type: 'string',
            description: 'One sentence describing what this validates',
          },
          focusArea: {
            type: 'string',
            enum: ['new-feature', 'regression-check', 'api-change'],
          },
          html: {
            type: 'string',
            description: 'Complete self-contained HTML file content',
          },
        },
      },
    },
  },
};

export async function generateExamples({analysis}) {
  const prompt = buildPrompt(analysis);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: SYSTEM,
    messages: [{role: 'user', content: prompt}],
    tools: [{
      name: 'submit_examples',
      description: 'Submit the generated HTML examples',
      input_schema: EXAMPLES_SCHEMA,
    }],
    tool_choice: {type: 'tool', name: 'submit_examples'},
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('Generate: no structured output from model');

  const examples = toolUse.input.examples;
  const outputDir = join(__dir, 'output');
  await mkdir(outputDir, {recursive: true});

  for (const ex of examples) {
    ex.filename = `${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    await writeFile(join(outputDir, ex.filename), ex.html, 'utf8');
  }

  return examples;
}

function buildPrompt(analysis) {
  const changes = analysis.apiChanges
    .map(c => `  - [${c.type}] ${c.description} in ${c.layerOrModule}`)
    .join('\n') || '  (none documented)';

  const risks = analysis.regressionRisks
    .map(r => `  - ${r}`)
    .join('\n') || '  (none identified)';

  return `Generate ${analysis.exampleCount} deck.gl validation example(s) for this PR.

**Summary**: ${analysis.summary}

**Affected layers/modules**: ${analysis.changedLayers.join(', ')}

**API changes**:
${changes}

**Regression risks** (things that might have broken):
${risks}

Generate focused, minimal examples. A maintainer should be able to open them in a browser
and immediately confirm the feature works and nothing obvious regressed.`;
}
