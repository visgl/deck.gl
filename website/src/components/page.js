/* global window */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';

import DemoLauncher from './demo-launcher';
import InfoPanel from './info-panel';
import MarkdownPage from './markdown-page';
import {loadContent, updateMapSize} from '../actions/app-actions';

class Page extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: this._loadContent(props.content)
    };
  }

  componentDidMount() {
    window.onresize = this._resizeMap;
    this._resizeMap();
  }

  componentWillReceiveProps(nextProps) {
    const {content} = nextProps;
    if (this.props.content !== content) {
      this.setState({
        content: this._loadContent(content)
      });
    }
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  _loadContent(content) {
    if (typeof content === 'string') {
      this.props.loadContent(content);
    }
    return content;
  }

  @autobind _resizeMap() {
    const page = document.querySelector('.page');
    if (page) {
      this.props.updateMapSize({
        width: page.clientWidth,
        height: page.clientHeight
      });
    }
  }

  @autobind _renderDemo(name, sourceLink) {
    return (
      <div className="demo">
        <DemoLauncher demo={name} />
        <InfoPanel demo={name} >

          {sourceLink && (<div className="source-link">
            <a href={sourceLink} target="_new">View Code ↗</a>
          </div>)}

        </InfoPanel>
      </div>
    );
  }

  // replaces the current query string in react-router
  @autobind _updateQueryString(queryString) {
    const {history} = this.props;
    const {location, search} = history;

    if (search !== queryString) {
      history.replace({
        pathname: location.pathname,
        search: queryString
      });
    }
  }

  render() {
    const {contents, location: {search}} = this.props;
    const {content} = this.state;

    let child;

    if (content.demo) {
      child = this._renderDemo(content.demo, content.code);
    } else if (typeof content === 'string') {
      child = (<MarkdownPage content={contents[content]}
        query={search}
        updateQueryString={this._updateQueryString}
        renderDemo={this._renderDemo} />);
    }

    return <div className="page">{child}</div>;
  }
}

function mapStateToProps(state) {
  return {
    contents: state.contents
  };
}

export default connect(mapStateToProps, {loadContent, updateMapSize})(Page);
