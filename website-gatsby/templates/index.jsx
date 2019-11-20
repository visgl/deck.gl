import React from 'react';
import {Home} from 'ocular-gatsby/components';
import './style.scss';

if (typeof window !== 'undefined') {
  window.website = true;
}

const HeroExample = require('./examples/example-line-layer').default;

export default class IndexPage extends React.Component {
  render() {
    return <Home HeroExample={HeroExample} />;
  }
}
