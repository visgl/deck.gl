/* global window */
import React, {Component, PropTypes} from 'react';
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
      tabs: this._loadContent(props.route.content)
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
        tabs: this._loadContent(route.content)
      });
    }
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  _loadContent(content) {
    if (typeof content !== 'object') {
      content = {content};
    }

    // grab text contents
    Object.keys(content).forEach(key => {

      if (key === 'demo') {
        return;
      }

      const src = content[key];
      if (typeof src === 'string') {
        this.props.loadContent(src);
      }
    });

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

  @autobind _setActiveTab(tabName) {
    const {location: {pathname}} = this.props;
    this.context.router.replace(`${pathname}?tab=${tabName}`);
  }

  @autobind _renderDemo(name) {
    const {mapHasFocus} = this.state;

    return (
      <div className="demo">
        <Map
          demo={name}
          onInteract={this._onMapFocus} />
        <InfoPanel
          demo={name}
          hasFocus={!mapHasFocus}
          onInteract={this._onMapBlur} />
      </div>
    );
  }

  _renderTabContent() {
    const {contents, location} = this.props;
    const {tabs} = this.state;
    const activeTab = location.query.tab || Object.keys(tabs)[0];

    return Object.keys(tabs).map((tabKey, tabIndex) => {
      const tab = tabs[tabKey];
      let child;

      if (tabKey === 'demo') {
        child = this._renderDemo(tab);
      } else if (typeof tab === 'string') {
        child = <MarkdownPage content={contents[tab]} renderDemo={this._renderDemo} />;
      } else {
        child = React.createElement(tab);
      }

      return (
        <div key={tabIndex} className={`tab ${tabKey === activeTab ? 'active' : ''}`}>
          {child}
        </div>
      );
    });
  }

  _renderTabs() {
    const {location} = this.props;
    const {tabs} = this.state;
    const activeTab = location.query.tab || Object.keys(tabs)[0];

    return (
      <ul className="tabs">

        {activeTab === 'demo' && (
          <li><span className="bg-black tip">Hold down shift key to rotate</span></li>
        )}

        {Object.keys(tabs).map(tabName => (
          <li key={tabName} className={`${tabName === activeTab ? 'active' : ''}`}>
            <button onClick={this._setActiveTab.bind(this, tabName)}>
              {tabName}
            </button>
          </li>
        ))}

      </ul>
    );
  }

  render() {
    const {tabs} = this.state;

    return (
      <div className="page">
        {Object.keys(tabs).length > 1 && this._renderTabs()}
        {this._renderTabContent()}
      </div>
    );
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
