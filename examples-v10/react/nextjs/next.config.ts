// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import fs from 'node:fs';
import path from 'node:path';
import type {NextConfig} from 'next';

/** The root of the deck.gl checkout that contains this example. */
const DECK_GL_ROOT = path.resolve(import.meta.dirname, '../../..');

/**
 * For `yarn start-local`: maps every `@deck.gl/*` import, subpaths included, to the package built
 * in the deck.gl checkout, following each package's `exports`. Everything else, such as MapLibre,
 * still comes from this example's own `node_modules`, and Next.js's own React alias covers the
 * deck.gl packages too.
 */
function getLocalDeckGLAliases(): Record<string, string> {
  const scope = path.join(DECK_GL_ROOT, 'node_modules/@deck.gl');
  const aliases: Record<string, string> = {};
  for (const name of fs.readdirSync(scope)) {
    const packageDir = fs.realpathSync(path.join(scope, name));
    const {exports} = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
    for (const [subpath, target] of Object.entries<string | {import?: string}>(exports ?? {})) {
      const file = typeof target === 'string' ? target : target.import;
      if (file && subpath !== './package.json' && !subpath.includes('*')) {
        aliases[`@deck.gl/${name}${subpath.slice(1)}$`] = path.join(packageDir, file);
      }
    }
  }
  return aliases;
}

const config: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  // Don't write an AGENTS.md into the example on `next dev`.
  agentRules: false,
  ...(process.env.DECK_GL_LOCAL === 'true' && {
    outputFileTracingRoot: DECK_GL_ROOT,
    webpack: webpackConfig => {
      Object.assign(webpackConfig.resolve.alias, getLocalDeckGLAliases());
      return webpackConfig;
    }
  })
};

export default config;
