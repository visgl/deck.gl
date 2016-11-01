import 'babel-polyfill';
import marked from 'marked';
import {highlight} from 'highlight.js';
import React, {Component, PropTypes} from 'react';

export default class MarkdownPage extends Component {

  render() {
    const {content} = this.props;

    if (content) {
      marked.setOptions({
        highlight: function (code) {
          return require('highlight.js').highlightAuto(code).value;
        }
      });

      return (
        <div className="markdown">
          <div className="markdown-body" dangerouslySetInnerHTML={{__html: marked(content)}} />
        </div>
      );
    }
    return <div />;
  }
}

MarkdownPage.propTypes = {
  content: PropTypes.string
};
