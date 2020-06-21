import React, {PureComponent} from 'react';

export default class Spinner extends PureComponent {

  render() {
    const {meta} = this.props;
    
    if (!Number.isFinite(meta.progress) && !Number.isFinite(meta.progressAlt)) {
      return null;
    }

    const progress = (meta.progress || 0) + (meta.progressAlt || 0);
    const percentage = Math.round(progress * 1000) / 10;
    const text = `Loading... ${percentage}%`;

    return (
      <div className={`spinner ${progress >= 1 ? 'done' : ''}`}>
        <div className="spinner--text" >{text}</div>
        <div className="spinner--fill" style={{width: `${percentage}%`}} >
          {text}
        </div>
      </div>
    );
  }

}
