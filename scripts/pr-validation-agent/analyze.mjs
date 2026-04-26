import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Keep analysis cost low: Haiku is fast and cheap for structured extraction.
// We truncate large diffs because Haiku doesn't need the full context — it
// just needs to identify what layer/prop/module changed.
function truncateDiff(diff, maxLines = 600) {
  const lines = diff.split('\n');
  if (lines.length <= maxLines) return diff;
  return [
    ...lines.slice(0, maxLines),
    `\n... [diff truncated — ${lines.length - maxLines} more lines not shown]`,
  ].join('\n');
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  required: ['summary', 'changedLayers', 'apiChanges', 'regressionRisks', 'exampleCount', 'skip'],
  properties: {
    summary: {
      type: 'string',
      description: 'One sentence describing what changed',
    },
    changedLayers: {
      type: 'array',
      items: {type: 'string'},
      description: 'Layer or module names affected, e.g. ["ArcLayer", "@deck.gl/widgets"]',
    },
    apiChanges: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'description', 'layerOrModule'],
        properties: {
          type: {
            type: 'string',
            enum: ['new-prop', 'changed-prop', 'removed-prop', 'new-layer', 'new-widget', 'bug-fix', 'behavior-change'],
          },
          description: {type: 'string'},
          layerOrModule: {type: 'string'},
        },
      },
    },
    regressionRisks: {
      type: 'array',
      items: {type: 'string'},
      description: 'Adjacent features that might have regressed due to this change',
    },
    exampleCount: {
      type: 'integer',
      minimum: 1,
      maximum: 3,
      description: 'How many examples to generate (1–3; prefer fewer)',
    },
    skip: {
      type: 'boolean',
      description: 'True if visual examples are not warranted for this PR type',
    },
    skipReason: {
      type: 'string',
      description: 'Required when skip=true — why no examples are needed',
    },
  },
};

const SYSTEM = `You analyze deck.gl pull request diffs to decide what validation examples to generate.

deck.gl is a WebGL data visualization framework. Its main layer types include:
ScatterplotLayer, ArcLayer, LineLayer, PathLayer, SolidPolygonLayer, PolygonLayer, GeoJsonLayer,
IconLayer, TextLayer, ColumnLayer, GridLayer, HeatmapLayer, ContourLayer, H3HexagonLayer,
TripsLayer, MVTLayer, TileLayer, ScenegraphLayer, SimpleMeshLayer, and more.
Modules: @deck.gl/core, @deck.gl/layers, @deck.gl/aggregation-layers, @deck.gl/extensions,
@deck.gl/widgets, @deck.gl/carto, @deck.gl/geo-layers, @deck.gl/mesh-layers.

SKIP example generation for: documentation-only changes, CI/build/config changes, test
infrastructure changes, Python binding changes only, pure type-only diffs, changelog updates.

GENERATE examples for: changes that affect rendered output, new or modified public props,
new layers or widgets, behavior fixes visible in the viewport, extension changes.

Keep exampleCount low (1 is often enough). Regression risks should be specific, not generic.`;

export async function analyzeDiff({diff, prTitle, prHeadSha}) {
  const truncated = truncateDiff(diff);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `PR Title: ${prTitle}\nCommit: ${prHeadSha}\n\nDiff:\n\`\`\`diff\n${truncated}\n\`\`\``,
    }],
    tools: [{
      name: 'report_analysis',
      description: 'Submit the structured PR analysis',
      input_schema: ANALYSIS_SCHEMA,
    }],
    tool_choice: {type: 'tool', name: 'report_analysis'},
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  if (!toolUse) throw new Error('Analyze: no structured output from model');
  return toolUse.input;
}
