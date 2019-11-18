/* global document */
let lastPickedObject;
let lastTooltip;

const DEFAULT_STYLE = {
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  display: 'flex',
  flex: 'wrap',
  maxWidth: '500px',
  flexDirection: 'column',
  zIndex: 2
};

function getDiv() {
  return document.createElement('div');
}

export function getTooltipDefault(pickedInfo) {
  if (!pickedInfo.picked) {
    return null;
  }
  if (pickedInfo.object === lastPickedObject) {
    return lastTooltip;
  }
  const tooltip = {
    html: tabularize(pickedInfo.object),
    style: DEFAULT_STYLE
  };
  lastTooltip = tooltip;
  lastPickedObject = pickedInfo.object;
  return tooltip;
}

const EXCLUDES = new Set(['position', 'index']);

export function tabularize(json) {
  // Turns a JSON object of picked info into HTML for a tooltip
  const dataTable = getDiv();

  // Creates rows of two columns for the tooltip
  for (const key in json) {
    if (EXCLUDES.has(key)) {
      continue; // eslint-disable-line
    }
    const header = getDiv();
    header.className = 'header';
    header.textContent = key;

    const valueElement = getDiv();
    valueElement.className = 'value';

    valueElement.textContent = toText(json[key]);

    const row = getDiv();

    setStyles(row, header, valueElement);

    row.appendChild(header);
    row.appendChild(valueElement);
    dataTable.appendChild(row);
  }

  return dataTable.innerHTML;
}

function setStyles(row, header, value) {
  // Set default tooltip style
  Object.assign(header.style, {
    fontWeight: 700,
    marginRight: '10px',
    flex: '1 1 0%'
  });

  Object.assign(value.style, {
    flex: 'none',
    maxWidth: '250px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  });

  Object.assign(row.style, {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  });
}

export function toText(jsonValue) {
  // Set contents of table value, trimming for certain types of data
  let text;
  if (Array.isArray(jsonValue) && jsonValue.length > 4) {
    text = `Array<${jsonValue.length}>`;
  } else if (typeof jsonValue === 'string') {
    text = jsonValue;
  } else if (typeof jsonValue === 'number') {
    text = String(jsonValue);
  } else {
    try {
      text = JSON.stringify(jsonValue);
    } catch (err) {
      text = '<Non-Serializable Object>';
    }
  }
  const MAX_LENGTH = 50;
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH);
  }
  return text;
}

export function substituteIn(template, json) {
  let output = template;
  for (const key in json) {
    output = output.replace(`{${key}}`, json[key]);
  }

  return output;
}

export default function makeTooltip(tooltip) {
  /*
   * If explictly no tooltip passed by user, return null
   * If a JSON object passed, return a tooltip based on that object
   *   We expect the user has passed a string template that will take pickedInfo keywords
   * If a boolean passed, return the default tooltip
   */
  if (!tooltip) {
    return null;
  }

  if (tooltip.html || tooltip.text) {
    return pickedInfo => {
      if (!pickedInfo.picked) {
        return null;
      }

      const formattedTooltip = {
        style: tooltip.style || DEFAULT_STYLE
      };

      if (tooltip.html) {
        formattedTooltip.html = substituteIn(tooltip.html, pickedInfo.object);
      } else {
        formattedTooltip.text = substituteIn(tooltip.text, pickedInfo.object);
      }

      return formattedTooltip;
    };
  }

  return getTooltipDefault;
}
