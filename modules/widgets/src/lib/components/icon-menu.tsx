import type {JSX} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {IconButton} from './icon-button';
import {ButtonGroup} from './button-group';
import {GroupedIconButton} from './grouped-icon-button';

export type IconMenuProps<KeyType = string> = {
  className: string;
  icon?: JSX.Element;
  label?: string;
  menuItems: {value: KeyType; icon: JSX.Element; label: string}[];
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
  const icon = (props.icon || selectedMenuItem?.icon)!;

  return (
    <div style={{position: 'relative', display: 'inline-block'}} ref={containerRef}>
      <IconButton className={props.className} label={label} onClick={handleButtonClick}>
        {icon}
      </IconButton>
      {menuOpen && (
        <div className="deck-widget-icon-menu">
          <ButtonGroup orientation="vertical">
            {props.menuItems.map(item => (
              <GroupedIconButton
                key={item.value}
                label={item.label}
                onClick={() => handleSelectItem(item.value)}
              >
                {item.icon}
              </GroupedIconButton>
            ))}
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
