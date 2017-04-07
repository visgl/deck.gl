/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {json as requestJson} from 'd3-request';

import DeckGLOverlay from './deckgl-overlay.js';
import {LOGIC} from './src/constants';

const noop = () => {};

const Button = ({id, label, className = 'button', onClick = noop}) =>
  <button id={id} key={id} className={className} onClick={onClick}>
    {label}
  </button>;

class Root extends Component {
  //
  // REACT LIFECYCLE
  //
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      data: null,
      initialData: null
    };

    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);

    this._onAddSubgraph = this._onAddSubgraph.bind(this);
    this._onCollapseNode = this._onCollapseNode.bind(this);
    this._onResetGraph = this._onResetGraph.bind(this);

    requestJson('./data/sample-graph.json', (error, response) => {
      if (!error) {
        // apply timestamp and push loaded sample data into array
        this.setState({
          data: [
            Object.assign({}, response, {
              timestamp: Date.now()
            })
          ],
          initialData: response
        });
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this._animationFrame);
  }

  //
  // INTERACTION / UPDATING
  //
  _animate() {
    this.forceUpdate();
    if (typeof window !== 'undefined') {
      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onHover(el) {
    if (el) {
      this.setState({hovered: el});
    }
  }

  _onClick(el) {
    const {clicked} = this.state;
    this.setState({clicked: el && el.id && clicked && clicked.id &&
      el.id === clicked.id ? null : el
    });
  }

  _onDoubleClick(el) {
    this.setState({doubleClicked: el});
  }

  _onAddSubgraph() {
    const subgraph = {
      nodes: [
        {id: 0, type: 1},
        {id: 10, type: 1},
        {id: 13, type: 1},
        {id: 101, type: 2},
        {id: 102, type: 2}
      ],
      links: [
        {id: 101, source: 0, target: 101},
        {id: 102, source: 13, target: 101},
        {id: 103, source: 10, target: 102},
        {id: 104, source: 0, target: 102}
      ],
      logic: LOGIC.OR,
      timestamp: Date.now()
    };

    this.setState({data: [...this.state.data, subgraph]});
  }

  _getDegree(links, node) {
    return links.filter(link => {
      return link.source.id === node.id || link.target.id === node.id;
    }).length;
  }

  _onCollapseNode() {
    const node = {id: 4, type: 0};
    const nodes = [];
    const links = [];
    const {initialData} = this.state;

    initialData.links.forEach(link => {
      const {source, target} = link;
      if (source.id === node.id || target.id === node.id) {
        const targetDeg = this._getDegree(initialData.links, target);
        const sourceDeg = this._getDegree(initialData.links, source);

        if (source.id === node.id && targetDeg < 2) {
          nodes.push(target);
          links.push(link);
        } else if (target.id === node.id && sourceDeg < 2) {
          nodes.push(source);
          links.push(link);
        }
      }
    });

    const deltaGraph = {
      nodes,
      links,
      logic: LOGIC.NOT,
      timestamp: Date.now()
    };

    this.setState({data: [...this.state.data, deltaGraph]});
  }

  _onResetGraph() {
    this.setState({
      data: [
        Object.assign({}, this.state.initialData, {
          timestamp: Date.now()
        })
      ]
    });
  }

  //
  // RENDERING
  //
  _renderGraph() {
    const {viewport, data} = this.state;
    const handlers = {
      onHover: this._onHover,
      onClick: this._onClick,
      onDoubleClick: this._onDoubleClick
    };

    return data && data.length && (
      <DeckGLOverlay
        viewport={viewport}
        data={data}
        {...handlers} />
    );
  }

  _renderControlPanel() {
    return (
      <div className="control-panel">
        <div className="label">Graph manipulation: </div>
        <Button onClick={this._onAddSubgraph} label="add subgraph"/>
        <Button onClick={this._onCollapseNode} label="collapse node"/>
        {/* <Button onClick={this._onExpandNode} label="expand node"/> */}
        <Button onClick={this._onResetGraph} label="reset graph"/>
      </div>
    );
  }
  /*
  _renderStatusPanel() {
    const {hovered, clicked, doubleClicked} = this.state;

    let selected = null;
    let label = '';

    if (doubleClicked && Object.keys(doubleClicked).length > 0) {
      selected = doubleClicked;
      label = 'Double clicked';
    } else if (clicked && Object.keys(clicked).length > 0) {
      selected = clicked;
      label = 'Clicked';
    } else if (hovered && Object.keys(hovered).length > 0) {
      selected = hovered;
      label = 'Hovered';
    }
    return (
      <div className='status-panel'>
        {selected && <div>
          <div className='label'>{label}:</div>
          <div className='line'/>
          {Object.keys(selected).map(key => (
            <div key={key} className='item'>{key}: {selected[key]}</div>
          ))}
        </div>}
      </div>
    );
  }
  */
  render() {
    return (
      <div>
        { this._renderGraph() }
        { this._renderControlPanel() }
        {/* this._renderStatusPanel() */}
      </div>
    );
  }

}

render(<Root />, document.body.appendChild(document.createElement('div')));
