import {h, render} from 'preact';

export const IconButton = props => {
  const {size, label, onClick} = props;
  return (
    <div className="deckgl-widget-button-border">
      <button className="deckgl-widget-button" type="button" onClick={onClick} title={label}>
        <svg
          className="deckgl-widget-button-icon"
          fill="none"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {props.children}
        </svg>
      </button>
    </div>
  );
};
