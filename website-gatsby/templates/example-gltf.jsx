import React from 'react';

import AnimationLoopRunner from '../src/components/animation-loop-runner';
import AnimationLoop from '../examples/gltf/app';

export default class Example extends React.Component {
  render() {
    console.error('runner');
    return (
      <AnimationLoopRunner AnimationLoop={AnimationLoop} />
    );
  }
}
