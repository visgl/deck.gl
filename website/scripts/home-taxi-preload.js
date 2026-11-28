// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const {readFile, writeFile} = require('node:fs/promises');
const {join} = require('node:path');

/** Adds preload hints for the live taxi scene to the generated homepage. */
module.exports = function homeTaxiPreload() {
  let sceneScripts = [];

  return {
    name: 'home-taxi-preload',
    /** Records the client files emitted for the taxi scene chunk group. */
    configureWebpack(_config, isServer) {
      if (!isServer) {
        return {
          plugins: [
            {
              apply(compiler) {
                compiler.hooks.done.tap('HomeTaxiPreload', ({compilation}) => {
                  const scene = compilation.namedChunkGroups.get('home-taxi-scene');
                  sceneScripts = scene?.getFiles().filter(file => file.endsWith('.js')) ?? [];
                });
              }
            }
          ]
        };
      }
    },
    /** Uses the build's base URL so preloads work at both / and /next/. */
    async postBuild({outDir, baseUrl}) {
      if (sceneScripts.length) {
        const homepage = join(outDir, 'index.html');
        const html = await readFile(homepage, 'utf8');
        // Start the shared chunks alongside hydration. The normal import still executes them.
        const preloads = sceneScripts
          .map(
            file => `<link rel="preload" as="script" href="${baseUrl}${file}" fetchpriority="low">`
          )
          .join('');
        await writeFile(
          homepage,
          html.replace('</head>', () => `${preloads}</head>`)
        );
      }
    }
  };
};
