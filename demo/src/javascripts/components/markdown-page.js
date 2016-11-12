import 'babel-polyfill';
import marked from 'marked';
import {highlight} from 'highlight.js';
import React, {Component, PropTypes} from 'react';
import pureRender from 'pure-render-decorator';

/**
 * This map allows you to rewrite urls present in the markdown files
 * to be rewritted to point to other targets. It is useful so that
 * links can works both by browsing the docs using the Github explorer
 * and on the website.
 *
 * If you specify a value of false, it will transform the link to a simple
 * text, in case you don't want this link to point to anything.
 */
const urlRewrites = {
  '/docs/layers/base-layer.md': '#/layers/catalog/layer-base-class',
  '/docs/custom-layers.md#layerencodepickingcolorindex--number': false,
  '/docs/layers/arc-layer.md': '#/layers/core-layers/arc-layer',
  '/docs/layers/line-layer.md': '#/layers/core-layers/line-layer',
  '/docs/layers/choropleth-layer.md': '#/layers/core-layers/choropleth-layer',
  '/docs/layers/scatterplot-layer.md': '#/layers/core-layers/scatterplot-layer',
  '/docs/64-bits.md': '#/documentation/advanced-topics/64-layers'
};

/**
 * Same as above, but for image src's
 */
const imageRewrites = {};

@pureRender
export default class MarkdownPage extends Component {

  render() {
    const {content} = this.props;

    if (!content) { return null; }

    marked.setOptions({
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    });

    const renderer = new marked.Renderer();

    renderer.link = (href, title, text) => {
      const to = urlRewrites[href] === undefined ? href : urlRewrites[href];
      if (to === false) { return `<span>${text}</span>`; }
      return `<a href=${to} title=${title}>${text}</a>`;
    };

    renderer.image = (href, title, text) => {
      const src = imageRewrites[href] || href;
      return `<img src=${src} title=${title} alt=${text} />`;
    };

    // Since some images are embedded as html, it won't be processed by
    // the renderer image override. So hard replace it globally.
    const __html = marked(content, {renderer})
      .replace(/\/demo\/src\/static\/images/g, 'images');

    return (
      <div className="markdown">
        <div className="markdown-body" dangerouslySetInnerHTML={{__html}} />
      </div>
    );
  }
}

MarkdownPage.propTypes = {
  content: PropTypes.string
};
