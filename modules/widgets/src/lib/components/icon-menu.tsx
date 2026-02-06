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
  /** Initial item for uncontrolled mode */
  initialItem?: KeyType;
  /** Controlled selected item - when provided, overrides internal state */
  selectedItem?: KeyType;
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

  const [internalSelectedItem, setInternalSelectedItem] = useState<KeyType>(
    props.selectedItem ?? props.initialItem!
  );

  // Use controlled value if provided, otherwise use internal state
  const selectedItem = props.selectedItem ?? internalSelectedItem;

  const handleSelectItem = (item: KeyType) => {
    // Only update internal state if uncontrolled
    if (props.selectedItem === undefined) {
      setInternalSelectedItem(item);
    }
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
