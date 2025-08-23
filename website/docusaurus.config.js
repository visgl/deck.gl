// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import {themes as prismThemes} from 'prism-react-renderer';
const lightCodeTheme = prismThemes.nightOwlLight;
const darkCodeTheme = prismThemes.nightOwl;

const webpack = require('webpack');
const {resolve} = require('path');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'deck.gl',
  tagline: 'GPU-powered, highly performant large-scale data visualization',
  url: 'https://deck.gl',
  baseUrl: process.env.STAGING ? '/deck.gl/' : '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: '/favicon.ico',
  organizationName: 'visgl', // Usually your GitHub org/user name.
  projectName: 'deck.gl', // Usually your repo name.
  trailingSlash: false,

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',
          sidebarPath: resolve('./src/docs-sidebar.js'),
          // Point to to the website directory in your repo.
          editUrl: 'https://github.com/visgl/deck.gl/tree/master/website'
        },
        theme: {
          customCss: [
            resolve('./src/styles.css'),
            resolve('./node_modules/maplibre-gl/dist/maplibre-gl.css'),
            resolve('../modules/widgets/dist/stylesheet.css')
          ]
        }
      })
    ]
  ],

  plugins: [
    [
      './ocular-docusaurus-plugin',
      {
        debug: true,
        resolve: {
          modules: [resolve('node_modules'), resolve('../node_modules')],
          alias: {
            '@deck.gl/aggregation-layers': resolve('../modules/aggregation-layers'),
            '@deck.gl/arcgis': resolve('../modules/arcgis'),
            '@deck.gl/carto': resolve('../modules/carto'),
            '@deck.gl/core': resolve('../modules/core'),
            '@deck.gl/extensions': resolve('../modules/extensions'),
            '@deck.gl/geo-layers': resolve('../modules/geo-layers'),
            '@deck.gl/google-maps': resolve('../modules/google-maps'),
            '@deck.gl/json': resolve('../modules/json'),
            '@deck.gl/layers': resolve('../modules/layers'),
            '@deck.gl/mapbox': resolve('../modules/mapbox'),
            '@deck.gl/mesh-layers': resolve('../modules/mesh-layers'),
            '@deck.gl/react': resolve('../modules/react'),
            'website-examples': resolve('../examples/website'),
            react: resolve('node_modules/react'),
            'react-dom': resolve('node_modules/react-dom'),
            '@luma.gl': resolve('../node_modules/@luma.gl'),
            '@math.gl': resolve('../node_modules/@math.gl'),
            '@loaders.gl/compression': resolve('node_modules/@loaders.gl/compression'),
            '@loaders.gl/i3s': resolve('node_modules/@loaders.gl/i3s'),
            '@loaders.gl/las': resolve('node_modules/@loaders.gl/las'),
            '@loaders.gl/obj': resolve('node_modules/@loaders.gl/obj'),
            '@loaders.gl/ply': resolve('node_modules/@loaders.gl/ply'),
            '@loaders.gl': resolve('../node_modules/@loaders.gl')
          }
        },
        plugins: [
          new webpack.EnvironmentPlugin([
            'MapboxAccessToken',
            'GoogleMapsAPIKey',
            'GoogleMapsMapId'
          ]),
          // These modules break server side bundling
          new webpack.IgnorePlugin({
            resourceRegExp: /asciify-image/
          })
        ],
        module: {
          rules: [
            // https://github.com/Esri/calcite-components/issues/2865
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false
              }
            }
          ]
        }
      }
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'examples',
        path: './src/examples',
        routeBasePath: 'examples',
        sidebarPath: resolve('./src/examples-sidebar.js'),
        breadcrumbs: false,
        docItemComponent: resolve('./src/components/example/doc-item-component.jsx')
      }
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'deck.gl',
        logo: {
          alt: 'vis.gl Logo',
          src: 'images/visgl-logo-dark.png',
          srcDark: 'images/visgl-logo-light.png'
        },
        items: [
          {
            to: '/examples',
            position: 'left',
            label: 'Examples'
          },
          {
            to: '/docs',
            position: 'left',
            label: 'Docs'
          },
          {
            to: '/showcase',
            position: 'left',
            label: 'Showcase'
          },
          {
            to: 'https://medium.com/vis-gl',
            label: 'Blog',
            position: 'left'
          },
          {
            href: 'https://github.com/visgl/deck.gl',
            label: 'GitHub',
            position: 'right'
          },
          {
            type: 'html',
            position: 'right',
            value: '<a href="https://openvisualization.org" target="_blank" style="content: \'\'; height: 28px; width: 100px; background-image: url(\'/images/openjs-foundation.svg\'); background-repeat: no-repeat;  background-size: 100px 28px; display: flex">'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Resources',
            items: [
              {
                label: 'API Reference',
                to: '/docs/api-reference/core/deck'
              },
              {
                label: 'Starter templates',
                href: 'https://github.com/visgl/deck.gl/tree/master/examples/get-started'
              },
              {
                label: 'Playground',
                href: '/playground'
              },
              {
                label: 'Codepen demos',
                href: 'https://codepen.io/vis-gl/'
              }
            ]
          },
          {
            title: 'Other vis.gl Libraries',
            items: [
              {
                label: 'deck.gl-community',
                href: 'https://visgl.github.io/deck.gl-community/'
              },
              {
                label: 'luma.gl',
                href: 'https://luma.gl'
              },
              {
                label: 'loaders.gl',
                href: 'https://loaders.gl'
              },
              {
                label: 'react-map-gl',
                href: 'https://visgl.github.io/react-map-gl'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'Slack workspace',
                href: 'https://slack-invite.openjsf.org'
              },
              {
                label: 'vis.gl blog on Medium',
                href: 'https://medium.com/vis-gl'
              },
              {
                label: 'GitHub',
                href: 'https://github.com/visgl/deck.gl'
              }
            ]
          }
        ],
        copyright: '<p>Copyright <a href="https://openjsf.org">OpenJS Foundation</a> and vis.gl contributors. All rights reserved. The <a href="https://openjsf.org">OpenJS Foundation</a> has registered trademarks and uses trademarks. For a list of trademarks of the <a href="https://openjsf.org">OpenJS Foundation</a>, please see our <a href="https://trademark-policy.openjsf.org">Trademark Policy</a> and <a href="https://trademark-list.openjsf.org">Trademark List</a>. Trademarks and logos not indicated on the <a href="https://trademark-list.openjsf.org">list of OpenJS Foundation trademarks</a> are trademarks&trade; or registered&reg; trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.</p><p><a href="https://openjsf.org">The OpenJS Foundation</a> | <a href="https://terms-of-use.openjsf.org">Terms of Use</a> | <a href="https://privacy-policy.openjsf.org">Privacy Policy</a> | <a href="https://bylaws.openjsf.org">Bylaws</a> | <a href="https://code-of-conduct.openjsf.org">Code of Conduct</a> | <a href="https://trademark-policy.openjsf.org">Trademark Policy</a> | <a href="https://trademark-list.openjsf.org">Trademark List</a> | <a href="https://www.linuxfoundation.org/cookies">Cookie Policy</a></p>'
      },
      algolia: {
        // The application ID provided by Algolia
        appId: '8EVYAVB4KT',
        // Public API key: it is safe to commit it
        apiKey: 'a3fe1388353d733272ffdf148c53eeaa',
        indexName: 'deck',
        // Optional: see doc section below
        contextualSearch: true,
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: false
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
