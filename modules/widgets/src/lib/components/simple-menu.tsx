import type {JSX} from 'preact';

const MENU_STYLE: JSX.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginTop: 'var(--menu-gap, 4px)',
  zIndex: 100
};

const MENU_ITEM_STYLE: JSX.CSSProperties = {
  background: 'white',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  pointerEvents: 'auto'
};

export type SimpleMenuProps = {
  menuItems: {key: string; label: string}[];
  onItemSelected: (key: string) => void;
  position: {x: number; y: number};
  style?: JSX.CSSProperties;
};

/** Renders a simple dropdown menu at an arbitrary position */
export const SimpleMenu = (props: SimpleMenuProps) => {
  const {menuItems, onItemSelected, position, style} = props;
  const styleOverride: JSX.CSSProperties = {
    ...MENU_STYLE,
    ...style,
    left: `${position.x}px`,
    top: `${position.y}px`
  };

  return (
    <div style={styleOverride}>
      {menuItems.map(({key, label}) => (
        <button
          key={key}
          style={{...MENU_ITEM_STYLE, display: 'block'}}
          onClick={_ => onItemSelected(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
