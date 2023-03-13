import React, {useCallback} from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  position: relative;
  width: 100%;

  &:last-child {
    margin-bottom: 20px;
  }

  > * {
    vertical-align: middle;
    white-space: nowrap;
  }
  label {
    display: inline-block;
    width: 40%;
    margin-right: 10%;
    margin-top: 2px;
    margin-bottom: 2px;
  }
  input,
  a,
  button {
    background: var(--ifm-background-surface-color);
    font-size: 0.9em;
    text-transform: none;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    padding: 0 4px;
    margin: 0;
    width: 50%;
    height: 20px;
    line-height: 1.833;
    text-align: left;
  }
  button {
    color: initial;
  }
  button:disabled {
    color: var(--ifm-color-gray-500);
    cursor: default;
    background: var(--ifm-color-gray-300);
  }
  input {
    border: solid 1px var(--ifm-color-gray-500);
    &:disabled {
      background: var(--ifm-color-gray-300);
    }
    &[type='checkbox'] {
      height: auto;
    }
  }
  .tooltip {
    left: 50%;
    top: 24px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms;
  }
  &:hover .tooltip {
    opacity: 1;
  }
`;

function RangeInput({name, min, max, step, displayName, displayValue, onChange}) {
  const onInput = useCallback(
    evt => {
      const {value} = evt.target;
      let newValue = Number(value);
      if (min !== undefined) {
        newValue = Math.max(min, newValue);
      }
      if (max !== undefined) {
        newValue = Math.min(max, newValue);
      }
      onChange(name, newValue);
    },
    [min, max, onChange]
  );

  return (
    <InputContainer>
      <label>{displayName}</label>
      <div className="tooltip">
        {displayName}: {String(displayValue)}
      </div>
      <input type="range" min={min} max={max} value={displayValue} step={step} onChange={onInput} />
    </InputContainer>
  );
}

function Checkbox({name, value, displayName, displayValue, onChange}) {
  const onInput = useCallback(
    evt => {
      const newValue = evt.target.checked;
      onChange(name, newValue);
    },
    [onChange]
  );

  return (
    <InputContainer>
      <label>{displayName}</label>
      <div className="tooltip">
        {displayName}: {String(displayValue)}
      </div>
      <input type="checkbox" checked={value} onChange={onInput} />
    </InputContainer>
  );
}

export default function GenericInput(props) {
  const {name, onChange, displayName, altValue, displayValue, ...otherProps} = props;

  const onInput = useCallback(
    evt => {
      onChange(name, evt.target.value);
    },
    [onChange]
  );

  const reset = useCallback(() => {
    onChange(name, altValue);
  }, [altValue, onChange]);

  const inputProps = otherProps;

  switch (props.type) {
    case 'link':
      return (
        <InputContainer>
          <label>{displayName}</label>
          <a href={displayValue} target="_new">
            {displayValue}
          </a>
        </InputContainer>
      );

    case 'function':
    case 'json':
      const editable = Boolean(altValue);
      return (
        <InputContainer>
          <label>{displayName}</label>
          <button type="text" disabled={!editable} onClick={reset}>
            {displayValue}
          </button>
        </InputContainer>
      );

    case 'select':
      return (
        <InputContainer>
          <label>{displayName}</label>
          <select onChange={onInput} value={displayValue}>
            {props.options.map((value, i) => (
              <option key={i} value={value}>
                {value}
              </option>
            ))}
          </select>
        </InputContainer>
      );

    case 'checkbox':
      return <Checkbox {...props} />;

    case 'range':
      return <RangeInput {...props} />;

    default:
      return (
        <InputContainer>
          <label>{displayName}</label>
          <div className="tooltip">
            {displayName}: {String(displayValue)}
          </div>
          <input {...inputProps} value={displayValue} onChange={onInput} />
        </InputContainer>
      );
  }
}
