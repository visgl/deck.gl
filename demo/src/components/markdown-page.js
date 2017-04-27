import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import marked from 'marked';
import * as Demos from './demos';
import {markdownFiles} from '../constants/pages';

/**
 * This map allows you to rewrite urls present in the markdown files
 * to be rewritted to point to other targets. It is useful so that
 * links can works both by browsing the docs using the Github explorer
 * and on the website.
 *
 * If rewrite returns a falsy value, it will transform the link to a simple
 * text, in case you don't want this link to point to anything.
 */
const urlRewrites = [
  {
    /*
     * Look for urls in the form of
     * `/docs/path/to/file.md#header`
     * and convert to
     * `#/documentation/path/to/page?section=header`
     */
    test: /^\/(docs\/.+?\.md)(#.*)?$/,
    rewrite: match => {
      const filepath = match[1];
      const hash = match[2] ? match[2].slice(1) : '';
      return `#/documentation${markdownFiles[filepath]}${hash ? '?section=' : ''}${hash}`;
    }
  }
];

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
  let to = href;

  urlRewrites.forEach(rule => {
    if (to && rule.test.test(to)) {
      to = rule.rewrite(to.match(rule.test));
    }
  });

  return to ? `<a href=${to}>${text}</a>` :
    `<span>${text}</span>`;
};
// images override
renderer.image = (href, title, text) => {
  const src = imageRewrites[href] || href;
  return `<img src=${src} title=${title} alt=${text} />`;
};

function renderMarkdown(content) {
  return marked(content, {renderer})
    // Since some images are embedded as html, it won't be processed by
    // the renderer image override. So hard replace it globally.
    .replace(/\/demo\/src\/static\/images/g, 'images');
}

export default class MarkdownPage extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      html: renderMarkdown(props.content)
    };
    this._anchorPositions = null;
    this._currentSection = null;
    this._internalScroll = false;
  }

  componentDidMount() {
    this._jumpTo(this.props.query.section);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content !== this.props.content) {
      this.setState({
        html: renderMarkdown(nextProps.content)
      });
      this._anchorPositions = null;
      this._currentSection = null;
    }
  }

  componentDidUpdate() {
    this._jumpTo(this.props.query.section);
  }

  // get the vertical scroll position of a DOM object relative to this component
  _getScrollPosition(object) {
    const {container} = this.refs;
    // give the header some breath room
    let top = -28;
    while (object && Number.isFinite(object.offsetTop) && object !== container) {
      top += object.offsetTop;
      object = object.parentNode;
    }
    return top;
  }

  // Because we use hash paths in react-router, hash jump links do not work
  // In-page links can be passed using ?section=<id>
  _jumpTo(section) {
    if (section !== this._currentSection) {
      const anchor = this.refs.container.querySelector(`#${section}`);
      const scrollTop = this._getScrollPosition(anchor);
      if (this.refs.container.scrollTop !== scrollTop) {
        this._internalScroll = true;
        this.refs.container.scrollTop = scrollTop;
      }
    }
  }

  // Find the current section and update the query string.
  // This helps preserve the scroll position when navigating cross pages.
  _onScroll(evt) {
    if (this._internalScroll) {
      // do not react to scrolling set by _jumpTo
      this._internalScroll = false;
      return;
    }

    let {_anchorPositions} = this;
    const top = evt.target.scrollTop;

    // Calculate all scroll positions of h2, h3 once
    if (!_anchorPositions) {
      _anchorPositions = {};
      // generate mapping of anchor id -> scrollTop
      const anchors = this.refs.container.querySelectorAll('h2[id],h3[id]');
      for (const anchor of anchors) {
        _anchorPositions[anchor.id] = this._getScrollPosition(anchor);
      }
      this._anchorPositions = _anchorPositions;
    }

    let currentSection;
    for (const id in _anchorPositions) {
      if (_anchorPositions[id] <= top) {
        currentSection = id;
      } else {
        break;
      }
    }

    if (currentSection !== this._currentSection) {
      this._currentSection = currentSection;
      // update query string in url
      this.props.updateQueryString(currentSection ? `?section=${currentSection}` : '');
    }
  }

  render() {
    const {html} = this.state;

    /* eslint-disable react/no-danger */
    return (
      <div className="markdown" ref="container" onScroll={this._onScroll.bind(this)}>
        {
          html.split(INJECTION_REG).map((__html, index) => {
            if (!__html) {
              return null;
            }
            if (Demos[__html]) {
              return <div key={index}>{ this.props.renderDemo(__html) }</div>;
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
