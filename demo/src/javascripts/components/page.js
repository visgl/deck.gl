import 'babel-polyfill';
import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import autobind from 'autobind-decorator';
import MapGL from 'react-map-gl';

import MarkdownPage from '../components/markdown-page';
import GenericInput from './input';
import * as Demos from './demos';
import * as appActions from '../actions/app-actions';
import ViewportAnimation from '../utils/map-utils';
import {MAPBOX_STYLES} from '../constants/defaults';
import MAPBOX_ACCESS_TOKEN from '../constants/mapbox-token';

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
    const {demo, ...docs} = content;
    const {viewport, loadData, useParams, updateMap, loadContent} = this.props;
    const DemoComponent = Demos[demo];

    if (DemoComponent) {
      loadData(demo, DemoComponent.data);
      useParams(DemoComponent.parameters);
      ViewportAnimation.fly(viewport, DemoComponent.viewport, 1000, updateMap)
        .easing(ViewportAnimation.Easing.Exponential.Out)
        .start();
    }

    // grab text contents
    Object.values(docs).forEach(src => {
      if (typeof src === 'string') {
        loadContent(src);
      }
    });

    return content;
  }

  @autobind
  _onUpdateMap(viewport) {
    this.setState({mapFocus: true});
    this.props.updateMap(viewport);
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

  _setActiveTab(tabName) {
    const {location: {pathname}} = this.props;
    this.context.router.replace(`${pathname}?tab=${tabName}`);
  }

  _renderMap() {
    const {viewport, vis: {params, owner, data}, updateMeta} = this.props;
    const {tabs: {demo}} = this.state;
    const DemoComponent = Demos[demo];
    const dataLoaded = owner === demo ? data : null;

    return (
      <MapGL
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        perspectiveEnabled={true}
        { ...viewport }
        onChangeViewport={ this._onUpdateMap }>

        <DemoComponent ref="demo" viewport={viewport} params={params}
          onStateChange={updateMeta}
          data={dataLoaded} />

      </MapGL>
    )
  }

  _renderOptions() {
    const {vis: {params, owner, meta}} = this.props;
    const {tabs: {demo}, mapFocus} = this.state;
    const DemoComponent = Demos[demo];
    const metaLoaded = owner === demo ? meta : {};

    return (
      <div className={`options-panel top-right ${mapFocus ? '' : 'focus'}`}
        onClick={ () => this.setState({mapFocus: false}) }>
        { DemoComponent.renderInfo(metaLoaded) }
        { Object.keys(params).length > 0 && <hr /> }
        {
          Object.keys(params).map((name, i) => (
            <GenericInput key={i} name={name} {...params[name]}
              onChange={this.props.updateParam} />
          ))
        }
      </div>
    );
  }

  _renderTabContent(tabName, tab) {
    const {contents, location} = this.props;
    const {tabs} = this.state;
    const activeTab = location.query.tab || Object.keys(tabs)[0];

    return Object.keys(tabs).map(tabName => {
      const tab = tabs[tabName];
      let child;

      if (tabName === 'demo') {
        child = (
          <div>
            { this._renderMap() }
            { this._renderOptions() }
          </div>
        )
      } else if (typeof tab === 'string') {
        child = <MarkdownPage content={contents[tab]} />;
      } else {
        child = React.createElement(tab);
      }

      return (
        <div key={tabName} className={`tab ${tabName === activeTab ? 'active' : ''}`}>
          { child }
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
        {
          activeTab === 'demo' &&
          <li><span className="bg-black tip">Hold down shift key to rotate map</span></li>

        }
        {
          Object.keys(tabs).map(tabName => (
            <li key={tabName} className={`${tabName === activeTab ? 'active' : ''}`}>
              <button onClick={ this._setActiveTab.bind(this, tabName) }>
                { tabName }
              </button>
            </li>
          ))
        }
      </ul>
    );
  }

  render() {
    const {tabs} = this.state;

    return (
      <div className="page">
        { Object.keys(tabs).length > 1 && this._renderTabs() }
        { this._renderTabContent() }
      </div>
    );
  }
}

Page.contextTypes = {
  router: PropTypes.object
};

export default connect(state => state, appActions)(Page);
