/* global window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';

import Map from './map';
import InfoPanel from './info-panel';
import MarkdownPage from './markdown-page';
import {loadContent, updateMap} from '../actions/app-actions';

class Page extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mapHasFocus: true,
      content: this._loadContent(props.route.content)
    };
  }

  componentDidMount() {
    window.onresize = this._resizeMap;
    this._resizeMap();
  }

  componentWillReceiveProps(nextProps) {
    const {route} = nextProps;
    if (this.props.route !== route) {
      this.setState({
        content: this._loadContent(route.content)
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.props.updateMap({
      width: w <= 768 ? w : w - 240,
      height: h - 64
    });
  }

  _setMapFocus(state) {
    if (this.state.mapHasFocus !== state) {
      this.setState({mapHasFocus: state});
    }
  }

  @autobind _onMapFocus() {
    this._setMapFocus(true);
  }

  @autobind _onMapBlur() {
    this._setMapFocus(false);
  }

  @autobind _renderDemo(name, sourceLink) {
    const {mapHasFocus} = this.state;

    return (
      <div className="demo">
        <Map
          demo={name}
          onInteract={this._onMapFocus} />
        <InfoPanel
          demo={name}
          hasFocus={!mapHasFocus}
          onInteract={this._onMapBlur} >

          {sourceLink && (<div className="source-link">
            <a href={sourceLink} target="_new">View Code ↗</a>
          </div>)}

        </InfoPanel>
      </div>
    );
  }

  // replaces the current query string in react-router
  @autobind _updateQueryString(queryString) {
    const {location: {pathname, search}} = this.props;
    if (search !== queryString) {
      this.context.router.replace({
        pathname,
        search: queryString
      });
    }
  }

  render() {
    const {contents, location: {query}} = this.props;
    const {content} = this.state;

    let child;

    if (content.demo) {
      child = this._renderDemo(content.demo, content.code);
    } else if (typeof content === 'string') {
      child = (<MarkdownPage content={contents[content]}
        query={query}
        updateQueryString={this._updateQueryString}
        renderDemo={this._renderDemo} />);
    }

    return <div className="page">{child}</div>;
  }
}

Page.contextTypes = {
  router: PropTypes.object
};

function mapStateToProps(state) {
  return {
    contents: state.contents
  };
}

export default connect(mapStateToProps, {loadContent, updateMap})(Page);
