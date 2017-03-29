import React, {PureComponent, PropTypes} from 'react';
import marked from 'marked';
import * as Demos from './demos';

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
  '/docs/layers/geojson-layer.md': '#/layers/core-layers/geojson-layer',
  '/docs/layers/scatterplot-layer.md': '#/layers/core-layers/scatterplot-layer',
  '/docs/64-bits.md': '#/documentation/advanced-topics/64-layers'
};

/**
 * Same as above, but for image src's
 */
const imageRewrites = {};

/* Look for demo injection tag */
const INJECTION_REG = /<!-- INJECT:"(.+)\" -->/g;

/* Markdown renderer */
marked.setOptions({
  // code highlight
  highlight: code => {
    return require('highlight.js').highlightAuto(code).value;
  }
});

const renderer = new marked.Renderer();
// links override
renderer.link = (href, title, text) => {
  const to = urlRewrites[href] === undefined ? href : urlRewrites[href];
  if (to === false) {
    return `<span>${text}</span>`;
  }
  return `<a href=${to} title=${title}>${text}</a>`;
};
// images override
renderer.image = (href, title, text) => {
  const src = imageRewrites[href] || href;
  return `<img src=${src} title=${title} alt=${text} />`;
};

export default class MarkdownPage extends PureComponent {

  render() {
    const {content, renderDemo} = this.props;

    // Since some images are embedded as html, it won't be processed by
    // the renderer image override. So hard replace it globally.
    const html = marked(content, {renderer})
      .replace(/\/demo\/src\/static\/images/g, 'images');

    /* eslint-disable react/no-danger */
    return (
      <div className="markdown">
        {
          html.split(INJECTION_REG).map((__html, index) => {
            if (!__html) {
              return null;
            }
            if (Demos[__html]) {
              return <div key={index}>{ renderDemo(__html) }</div>;
            }
            return <div key={index} className="markdown-body" dangerouslySetInnerHTML={{__html}} />;
          })
        }
      </div>
    );
    /* eslint-enable react/no-danger */

  }
}

MarkdownPage.propTypes = {
  content: PropTypes.string,
  renderDemo: PropTypes.func.isRequired
};

MarkdownPage.defaultProps = {
  content: ''
};
