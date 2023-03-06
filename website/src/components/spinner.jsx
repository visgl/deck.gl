import React from 'react';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  height: 18px;
  line-height: 18px;
  font-size: 10px;

  > div {
    white-space: nowrap;
    left: 0;
    bottom: 0;
    position: absolute;
    height: 18px;
    padding-left: 20px;
    transition: width 0.5s;
  }
  .spinner--fill {
    background: $primary;
    color: $white;
    overflow: hidden;
  }
  .spinner--text {
    color: $black-40;
  }

  &.done {
    height: 0 !important;
    line-height: 0;
    font-size: 0;
    transition: height 0.5s 1s;

    > div {
      height: 0 !important;
      transition: height 0.5s 1s;
    }
  }
`;

export default function Spinner({meta}) {
  if (!Number.isFinite(meta.progress) && !Number.isFinite(meta.progressAlt)) {
    return null;
  }

  const progress = (meta.progress || 0) + (meta.progressAlt || 0);
  const percentage = Math.round(progress * 1000) / 10;
  const text = `Loading... ${percentage}%`;

  return (
    <SpinnerContainer className={progress >= 1 ? 'done' : ''}>
      <div className="spinner--text">{text}</div>
      <div className="spinner--fill" style={{width: `${percentage}%`}}>
        {text}
      </div>
    </SpinnerContainer>
  );
}
