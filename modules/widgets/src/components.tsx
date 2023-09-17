import {h, render} from 'preact';

export const IconButton = props => {
  const {className, label, onClick} = props;
  return (
    <div className="deck-widget-button-border">
      <button className={`deck-widget-button ${className}`} type="button" onClick={onClick} title={label}>
        <div className="deck-widget-icon" />
      </button>
    </div>
  );
};
