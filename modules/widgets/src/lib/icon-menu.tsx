import type {JSX} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {IconButton} from './components';

const MENU_STYLE: JSX.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginTop: '4px',
  zIndex: 100
};

const MENU_ITEM_STYLE: JSX.CSSProperties = {
  background: 'white',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  pointerEvents: 'auto'
};

export type IconMenuProps<KeyType = string> = {
  className: string;
  icon?: () => JSX.Element;
  label?: string;
  menuItems: {value: KeyType; icon: () => JSX.Element; label: string}[];
  initialItem: KeyType;
  onItemSelected: (item: KeyType) => void;
};

/** A component that renders an icon popup menu */
export function IconMenu<KeyType extends string>(props: IconMenuProps<KeyType>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside.
  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const [selectedItem, setSelectedItem] = useState<KeyType>(props.initialItem);

  const handleSelectItem = (item: KeyType) => {
    setSelectedItem(item);
    setMenuOpen(false);
    props.onItemSelected(item);
  };

  const handleButtonClick = () => setMenuOpen(!menuOpen);

  const selectedMenuItem = props.menuItems.find(item => item.value === selectedItem);
  const label = props.label || selectedMenuItem?.label || '';
  const Icon = (props.icon || selectedMenuItem?.icon)!;

  return (
    <div style={{position: 'relative', display: 'inline-block'}} ref={containerRef}>
      <IconButton className={props.className} label={label} onClick={handleButtonClick}>
        <Icon />
      </IconButton>
      {menuOpen && (
        <div style={MENU_STYLE}>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {props.menuItems.map(item => (
              <button
                key={item.value}
                style={MENU_ITEM_STYLE}
                title={item.label}
                onClick={() => handleSelectItem(item.value)}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
