// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

export type CompactDropdownOption<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  disabled?: boolean;
}>;

export type CompactDropdownProps<Value extends string = string> = Readonly<{
  options: readonly CompactDropdownOption<Value>[];
  value?: Value;
  ariaLabel?: string;
  disabled?: boolean;
  onChange?: (value: Value, option: CompactDropdownOption<Value>) => void;
}>;

export type CompactDropdownSetValueOptions = Readonly<{
  emitChange?: boolean;
}>;

let nextDropdownIdentifier = 1;

/**
 * Compact, dependency-free select-only combobox for dark example control panels.
 *
 * The listbox is portalled to the document body so card overflow rules cannot clip it. Keyboard
 * focus remains on the trigger while `aria-activedescendant` communicates listbox navigation.
 */
export class CompactDropdown<Value extends string = string> {
  /** Root element containing the combobox trigger. The popup is portalled to `document.body`. */
  readonly element: HTMLDivElement;

  private readonly document: Document;
  private readonly trigger: HTMLButtonElement;
  private readonly valueElement: HTMLSpanElement;
  private readonly listbox: HTMLDivElement;
  private readonly ariaLabel: string;
  private readonly onChange?: (value: Value, option: CompactDropdownOption<Value>) => void;
  private options: readonly CompactDropdownOption<Value>[];
  private selectedValue: Value | null = null;
  private activeIndex = -1;
  private disabled: boolean;
  private openState = false;
  private destroyed = false;
  private typeaheadText = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement, props: CompactDropdownProps<Value>) {
    this.document = parent.ownerDocument;
    this.options = [...props.options];
    this.ariaLabel = props.ariaLabel ?? 'Select option';
    this.onChange = props.onChange;
    this.disabled = props.disabled ?? false;

    const identifier = nextDropdownIdentifier++;
    const triggerIdentifier = `compact-dropdown-trigger-${identifier}`;
    const listboxIdentifier = `compact-dropdown-listbox-${identifier}`;

    this.element = this.document.createElement('div');
    this.element.dataset.compactDropdown = '';
    this.element.innerHTML = `<style>${COMPACT_DROPDOWN_CSS}</style>`;

    this.trigger = this.document.createElement('button');
    this.trigger.id = triggerIdentifier;
    this.trigger.type = 'button';
    this.trigger.setAttribute('role', 'combobox');
    this.trigger.setAttribute('aria-label', this.ariaLabel);
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.trigger.setAttribute('aria-controls', listboxIdentifier);
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.dataset.compactDropdownTrigger = '';

    this.valueElement = this.document.createElement('span');
    this.valueElement.dataset.compactDropdownValue = '';
    const chevron = this.document.createElement('span');
    chevron.dataset.compactDropdownChevron = '';
    chevron.setAttribute('aria-hidden', 'true');
    this.trigger.append(this.valueElement, chevron);
    this.element.append(this.trigger);

    this.listbox = this.document.createElement('div');
    this.listbox.id = listboxIdentifier;
    this.listbox.hidden = true;
    this.listbox.setAttribute('role', 'listbox');
    this.listbox.setAttribute('aria-label', this.ariaLabel);
    this.listbox.dataset.compactDropdownPopup = '';

    parent.append(this.element);
    this.document.body.append(this.listbox);

    this.trigger.addEventListener('click', this.handleTriggerClick);
    this.trigger.addEventListener('keydown', this.handleKeyDown);
    this.listbox.addEventListener('click', this.handleOptionClick);
    this.listbox.addEventListener('pointermove', this.handleOptionPointerMove);
    this.document.addEventListener('pointerdown', this.handleDocumentPointerDown);
    this.document.addEventListener('focusin', this.handleDocumentFocusIn);

    this.renderOptions();
    const initialValue = props.value ?? this.getFirstEnabledOption()?.value;
    if (initialValue !== undefined) this.setValue(initialValue);
    this.updateDisabledState();
  }

  /** Currently selected value, or `null` when the dropdown has no options. */
  get value(): Value | null {
    return this.selectedValue;
  }

  /** Selects a value without emitting the change callback. */
  set value(value: Value | null) {
    if (value === null) {
      this.selectedValue = null;
      this.activeIndex = -1;
      this.updateSelection();
    } else {
      this.setValue(value);
    }
  }

  /** Updates the selection. Programmatic changes are silent unless `emitChange` is requested. */
  setValue(value: Value, options: CompactDropdownSetValueOptions = {}): boolean {
    const option = this.options.find(candidate => candidate.value === value);
    if (!option) return false;

    const changed = this.selectedValue !== value;
    this.selectedValue = value;
    this.activeIndex = this.options.indexOf(option);
    this.updateSelection();
    if (changed && options.emitChange) this.onChange?.(value, option);
    return true;
  }

  /** Replaces the option set, retaining the current value whenever it still exists. */
  setOptions(options: readonly CompactDropdownOption<Value>[]): void {
    this.options = [...options];
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    this.selectedValue = selectedOption?.value ?? this.getFirstEnabledOption()?.value ?? null;
    this.activeIndex = this.getSelectedIndex();
    this.renderOptions();
    this.updateSelection();
    this.updateDisabledState();
    if (this.openState) this.updatePopupPosition();
  }

  /** Enables or disables user interaction. */
  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.updateDisabledState();
    if (this.trigger.disabled) this.close();
  }

  /** Moves keyboard focus to the combobox trigger. */
  focus(): void {
    this.trigger.focus();
  }

  /** Opens the listbox when the control is enabled. */
  open(): void {
    if (this.openState || this.trigger.disabled || this.destroyed) return;
    this.openState = true;
    this.activeIndex = this.getSelectedIndex();
    if (this.activeIndex < 0) this.activeIndex = this.getNextEnabledIndex(-1, 1);
    this.listbox.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.element.dataset.open = 'true';
    this.updateActiveOption(true);
    this.updatePopupPosition();
    this.document.defaultView?.addEventListener('resize', this.handleViewportChange);
    this.document.defaultView?.addEventListener('scroll', this.handleViewportChange, true);
  }

  /** Closes the listbox and optionally restores focus to its trigger. */
  close(options: {restoreFocus?: boolean} = {}): void {
    if (!this.openState) return;
    this.openState = false;
    this.listbox.hidden = true;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.removeAttribute('aria-activedescendant');
    delete this.element.dataset.open;
    this.document.defaultView?.removeEventListener('resize', this.handleViewportChange);
    this.document.defaultView?.removeEventListener('scroll', this.handleViewportChange, true);
    if (options.restoreFocus) this.trigger.focus();
  }

  /** Removes the trigger, portalled listbox, and all global event listeners. */
  destroy(): void {
    if (this.destroyed) return;
    this.close();
    this.destroyed = true;
    this.trigger.removeEventListener('click', this.handleTriggerClick);
    this.trigger.removeEventListener('keydown', this.handleKeyDown);
    this.listbox.removeEventListener('click', this.handleOptionClick);
    this.listbox.removeEventListener('pointermove', this.handleOptionPointerMove);
    this.document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    this.document.removeEventListener('focusin', this.handleDocumentFocusIn);
    if (this.typeaheadTimer !== null) clearTimeout(this.typeaheadTimer);
    this.listbox.remove();
    this.element.remove();
  }

  private readonly handleTriggerClick = (): void => {
    if (this.openState) this.close();
    else this.open();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.openState) this.open();
        else this.moveActiveOption(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.openState) this.open();
        else this.moveActiveOption(-1);
        break;
      case 'Home':
        event.preventDefault();
        if (!this.openState) this.open();
        this.setActiveIndex(this.getNextEnabledIndex(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        if (!this.openState) this.open();
        this.setActiveIndex(this.getNextEnabledIndex(this.options.length, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.openState) this.selectActiveOption();
        else this.open();
        break;
      case 'Escape':
        if (this.openState) {
          event.preventDefault();
          this.close({restoreFocus: true});
        }
        break;
      case 'Tab':
        this.close();
        break;
      default:
        if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          if (!this.openState) this.open();
          this.moveActiveOptionByText(event.key);
        }
        break;
    }
  };

  private readonly handleOptionClick = (event: MouseEvent): void => {
    const index = this.getOptionIndex(event.target);
    if (index < 0 || this.options[index]?.disabled) return;
    this.activeIndex = index;
    this.selectActiveOption();
  };

  private readonly handleOptionPointerMove = (event: PointerEvent): void => {
    const index = this.getOptionIndex(event.target);
    if (index >= 0 && !this.options[index]?.disabled && index !== this.activeIndex) {
      this.setActiveIndex(index);
    }
  };

  private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target as Node | null;
    if (
      this.openState &&
      target &&
      !this.element.contains(target) &&
      !this.listbox.contains(target)
    ) {
      this.close();
    }
  };

  private readonly handleDocumentFocusIn = (event: FocusEvent): void => {
    const target = event.target as Node | null;
    if (
      this.openState &&
      target &&
      !this.element.contains(target) &&
      !this.listbox.contains(target)
    ) {
      this.close();
    }
  };

  private readonly handleViewportChange = (): void => {
    if (this.openState) this.updatePopupPosition();
  };

  private renderOptions(): void {
    this.listbox.replaceChildren(
      ...this.options.map((option, index) => {
        const optionElement = this.document.createElement('div');
        optionElement.id = `${this.listbox.id}-option-${index}`;
        optionElement.setAttribute('role', 'option');
        optionElement.setAttribute('aria-selected', String(option.value === this.selectedValue));
        if (option.disabled) optionElement.setAttribute('aria-disabled', 'true');
        optionElement.dataset.compactDropdownOption = '';
        optionElement.dataset.optionIndex = String(index);

        const label = this.document.createElement('span');
        label.textContent = option.label;
        const status = this.document.createElement('span');
        status.dataset.compactDropdownStatus = '';
        status.setAttribute('aria-hidden', 'true');
        optionElement.append(label, status);
        return optionElement;
      })
    );
  }

  private updateSelection(): void {
    const selectedOption = this.options.find(option => option.value === this.selectedValue);
    this.valueElement.textContent = selectedOption?.label ?? '—';
    this.trigger.title = selectedOption?.label ?? this.ariaLabel;
    for (const [index, optionElement] of this.getOptionElements().entries()) {
      optionElement.setAttribute(
        'aria-selected',
        String(this.options[index]?.value === this.selectedValue)
      );
    }
    this.updateActiveOption(false);
  }

  private updateDisabledState(): void {
    this.trigger.disabled = this.disabled || !this.options.some(option => !option.disabled);
  }

  private moveActiveOption(direction: 1 | -1): void {
    this.setActiveIndex(this.getNextEnabledIndex(this.activeIndex, direction));
  }

  private moveActiveOptionByText(character: string): void {
    if (this.typeaheadTimer !== null) clearTimeout(this.typeaheadTimer);
    this.typeaheadText += character.toLocaleLowerCase();
    let matchingIndex = this.getMatchingOptionIndex(this.typeaheadText);
    if (matchingIndex < 0 && this.typeaheadText.length > 1) {
      this.typeaheadText = character.toLocaleLowerCase();
      matchingIndex = this.getMatchingOptionIndex(this.typeaheadText);
    }
    if (matchingIndex >= 0) this.setActiveIndex(matchingIndex);
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadText = '';
      this.typeaheadTimer = null;
    }, 650);
  }

  private getMatchingOptionIndex(searchText: string): number {
    for (let offset = 1; offset <= this.options.length; offset++) {
      const index = (this.activeIndex + offset + this.options.length) % this.options.length;
      const option = this.options[index];
      if (!option?.disabled && option.label.toLocaleLowerCase().startsWith(searchText))
        return index;
    }
    return -1;
  }

  private getNextEnabledIndex(startIndex: number, direction: 1 | -1): number {
    if (!this.options.length) return -1;
    let index = startIndex;
    for (let attempt = 0; attempt < this.options.length; attempt++) {
      index = (index + direction + this.options.length) % this.options.length;
      if (!this.options[index]?.disabled) return index;
    }
    return -1;
  }

  private setActiveIndex(index: number): void {
    if (index < 0 || this.options[index]?.disabled) return;
    this.activeIndex = index;
    this.updateActiveOption(true);
  }

  private updateActiveOption(scrollIntoView: boolean): void {
    const optionElements = this.getOptionElements();
    for (const [index, optionElement] of optionElements.entries()) {
      if (index === this.activeIndex && this.openState) optionElement.dataset.active = 'true';
      else delete optionElement.dataset.active;
    }

    const activeElement = optionElements[this.activeIndex];
    if (this.openState && activeElement) {
      this.trigger.setAttribute('aria-activedescendant', activeElement.id);
      if (scrollIntoView) activeElement.scrollIntoView({block: 'nearest'});
    }
  }

  private selectActiveOption(): void {
    const option = this.options[this.activeIndex];
    if (!option || option.disabled) return;
    this.setValue(option.value, {emitChange: true});
    this.close({restoreFocus: true});
  }

  private getFirstEnabledOption(): CompactDropdownOption<Value> | undefined {
    return this.options.find(option => !option.disabled);
  }

  private getSelectedIndex(): number {
    return this.options.findIndex(option => option.value === this.selectedValue);
  }

  private getOptionIndex(target: EventTarget | null): number {
    const element = target as Element | null;
    const optionElement = element?.closest<HTMLElement>('[data-compact-dropdown-option]');
    if (!optionElement || !this.listbox.contains(optionElement)) return -1;
    return Number(optionElement.dataset.optionIndex ?? -1);
  }

  private getOptionElements(): HTMLElement[] {
    return Array.from(this.listbox.querySelectorAll<HTMLElement>('[role="option"]'));
  }

  private updatePopupPosition(): void {
    const view = this.document.defaultView;
    if (!view) return;

    const triggerBounds = this.trigger.getBoundingClientRect();
    const viewportPadding = 4;
    const popupGap = 3;
    const popupWidth = Math.min(
      Math.max(triggerBounds.width, 128),
      view.innerWidth - viewportPadding * 2
    );
    const popupLeft = Math.max(
      viewportPadding,
      Math.min(triggerBounds.left, view.innerWidth - popupWidth - viewportPadding)
    );
    const availableBelow = view.innerHeight - triggerBounds.bottom - popupGap - viewportPadding;
    const availableAbove = triggerBounds.top - popupGap - viewportPadding;
    const desiredHeight = Math.min(176, this.options.length * 20 + 2);
    const openAbove =
      availableBelow < Math.min(desiredHeight, 80) && availableAbove > availableBelow;
    const availableHeight = openAbove ? availableAbove : availableBelow;

    Object.assign(this.listbox.style, {
      left: `${popupLeft}px`,
      top: openAbove ? 'auto' : `${triggerBounds.bottom + popupGap}px`,
      bottom: openAbove ? `${view.innerHeight - triggerBounds.top + popupGap}px` : 'auto',
      width: `${popupWidth}px`,
      maxHeight: `${Math.max(40, Math.min(176, availableHeight))}px`
    });
  }
}

const COMPACT_DROPDOWN_CSS = /* css */ `
  [data-compact-dropdown] {
    position: relative;
    width: 100%;
    min-width: 0;
  }
  [data-compact-dropdown] *,
  [data-compact-dropdown-popup] * { box-sizing: border-box; }
  [data-compact-dropdown-trigger] {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 16px;
    align-items: center;
    width: 100%;
    height: 21px;
    min-width: 0;
    margin: 0;
    padding: 0 0 0 9px;
    appearance: none;
    border: 1px solid rgb(127 164 203 / 18%);
    border-bottom-color: rgb(95 180 220 / 30%);
    border-left-color: rgb(54 213 255 / 68%);
    border-radius: 1px;
    background: linear-gradient(90deg, rgb(11 27 39 / 98%), rgb(5 12 20 / 98%));
    box-shadow: inset 2px 0 rgb(54 213 255 / 12%), inset 0 -1px rgb(54 213 255 / 5%);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
    color: #cde3f4;
    cursor: pointer;
    font: 650 8px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: .055em;
    text-align: left;
    text-transform: uppercase;
  }
  [data-compact-dropdown-trigger]::before {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 2px;
    width: 1px;
    background: #44dfff;
    box-shadow: 0 0 5px rgb(68 223 255 / 58%);
    content: '';
  }
  [data-compact-dropdown-trigger]:hover,
  [data-compact-dropdown][data-open='true'] [data-compact-dropdown-trigger] {
    border-color: rgb(82 209 247 / 55%);
    border-left-color: #45ddff;
    background: linear-gradient(90deg, rgb(12 35 48 / 98%), rgb(6 16 25 / 98%));
    color: #effcff;
  }
  [data-compact-dropdown-trigger]:focus-visible {
    outline: 2px solid rgb(91 189 255 / 72%);
    outline-offset: 1px;
  }
  [data-compact-dropdown-trigger]:disabled {
    cursor: default;
    filter: saturate(.35);
    opacity: .48;
  }
  [data-compact-dropdown-value] {
    overflow: hidden;
    padding-right: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-compact-dropdown-chevron] {
    position: relative;
    align-self: stretch;
    border-left: 1px solid rgb(84 188 226 / 20%);
  }
  [data-compact-dropdown-chevron]::before,
  [data-compact-dropdown-chevron]::after {
    position: absolute;
    top: 9px;
    width: 5px;
    height: 1px;
    background: #62dfff;
    content: '';
  }
  [data-compact-dropdown-chevron]::before { left: 3px; transform: rotate(38deg); }
  [data-compact-dropdown-chevron]::after { right: 3px; transform: rotate(-38deg); }
  [data-compact-dropdown][data-open='true'] [data-compact-dropdown-chevron]::before {
    transform: rotate(-38deg);
  }
  [data-compact-dropdown][data-open='true'] [data-compact-dropdown-chevron]::after {
    transform: rotate(38deg);
  }
  [data-compact-dropdown-popup] {
    position: fixed;
    z-index: 2147483000;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 2px;
    border: 1px solid rgb(85 195 229 / 42%);
    border-left-color: rgb(63 222 255 / 84%);
    background: rgb(3 10 17 / 98%);
    box-shadow: 0 9px 24px rgb(0 0 0 / 72%), inset 2px 0 rgb(54 213 255 / 10%);
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    color: #cde3f4;
    scrollbar-color: rgb(74 184 216 / 58%) transparent;
    scrollbar-width: thin;
  }
  [data-compact-dropdown-popup][hidden] { display: none; }
  [data-compact-dropdown-option] {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 10px;
    align-items: center;
    height: 19px;
    padding: 0 4px 0 7px;
    border-left: 1px solid transparent;
    color: #9fb7ca;
    cursor: pointer;
    font: 650 8px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: .05em;
    text-transform: uppercase;
  }
  [data-compact-dropdown-option] > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-compact-dropdown-option][data-active='true'] {
    border-left-color: #49dcff;
    background: linear-gradient(90deg, rgb(36 160 195 / 22%), rgb(18 49 65 / 20%));
    color: #effcff;
  }
  [data-compact-dropdown-option][aria-selected='true'] { color: #bfefff; }
  [data-compact-dropdown-option][aria-disabled='true'] {
    cursor: default;
    opacity: .34;
  }
  [data-compact-dropdown-status] {
    justify-self: center;
    width: 4px;
    height: 4px;
    border: 1px solid rgb(95 201 230 / 24%);
    transform: rotate(45deg);
  }
  [data-compact-dropdown-option][aria-selected='true'] [data-compact-dropdown-status] {
    border-color: #6ee5ff;
    background: #45dfff;
    box-shadow: 0 0 5px rgb(69 223 255 / 70%);
  }
  @media (prefers-reduced-motion: no-preference) {
    [data-compact-dropdown-trigger],
    [data-compact-dropdown-option] { transition: color 90ms linear, background-color 90ms linear; }
  }
`;
