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
      mapFocus: true,
      tabs: this._loadContent(props.route.content)
    };
  }

  componentDidMount() {
    window.onresize = this._resizeMap.bind(this);
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

  @autobind
  _resizeMap() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.props.updateMap({
      width: w <= 768 ? w : w - 240,
      height: h - 64
    });
  }

  @autobind
  _setMapFocus(state) {
    this.setState({mapFocus: state});
  }

  _setActiveTab(tabName) {
    const {location: {pathname}} = this.props;
    this.context.router.replace(`${pathname}?tab=${tabName}`);
  }

  _renderChild(child, tabKey) {
    const {location} = this.props;
    const {tabs} = this.state;
    const activeTab = location.query.tab || Object.keys(tabs)[0];

    return (
      <div key={tabKey} className={`tab ${tabKey === activeTab ? 'active' : ''}`}>
        {child}
      </div>
    );
  }

  _renderTabContent() {
    const {contents} = this.props;
    const {tabs, mapFocus} = this.state;

    return Object.keys(tabs).map(tabKey => {
      const tab = tabs[tabKey];

      if (tabKey === 'demo') {

        const child = (
          <div>
            <Map
              demo={tab}
              onInteract={this._setMapFocus.bind(this, true)} />
            <InfoPanel
              demo={tab}
              hasFocus={!mapFocus}
              onInteract={this._setMapFocus.bind(this, false)} />
          </div>
        );

        return this._renderChild(child, tabKey);
      } else if (typeof tab === 'string') {
        return this._renderChild(<MarkdownPage content={contents[tab]} />, tabKey);
      }

      return this._renderChild(React.createElement(tab), tabKey);

    });
  }

  _renderTabs() {
    const {location} = this.props;
    const {tabs} = this.state;
    const activeTab = location.query.tab || Object.keys(tabs)[0];

    return (
      <ul className="tabs">

        {activeTab === 'demo' && (
          <li><span className="bg-black tip">Hold down shift key to rotate map</span></li>
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
