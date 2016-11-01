import 'babel-polyfill';
import marked from 'marked';
import {highlight} from 'highlight.js';
import React, {Component, PropTypes} from 'react';

const urlRewrites = {
  '/docs/layers/base-layer.md': '#/layers/base-layer/layer'
};

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
      const to = urlRewrites[href] || href;
      return `<a href=${to} title=${title}>${text}</a>`;
    };

    return (
      <div className="markdown">
        <div className="markdown-body" dangerouslySetInnerHTML={{__html: marked(content, {renderer})}} />
      </div>
    );
  }
}

MarkdownPage.propTypes = {
  content: PropTypes.string
};
