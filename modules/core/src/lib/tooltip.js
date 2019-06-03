/* global document */

// const TOOLTIP_EMPTY_STYLE = {
//   display: 'none'
// };
// const TOOLTIP_STYLE = {
//   'font-family': 'Helvetica, Arial, sans-serif',
//   position: 'absolute',
//   padding: '4px',
//   margin: '8px',
//   background: 'rgba(0, 0, 0, 0.8)',
//   color: '#fff',
//   'max-width': '300px',
//   'font-size': '10px',
//   'z-index': 9,
//   'pointer-events': 'none'
// };
// TODO where should the CSS be added?

const buildTable = (jsonObject, shouldIndent) => {
  const keys = Object.keys(jsonObject);
  if ('points' in keys) {
    const points = jsonObject.points;
    return buildTable({
      'First Point': `<br/>${buildTable(points[0], true)}`,
      'Number of Points': points.length
    });
  }
  let resStr = '';
  let row;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== 'screenCoord') {
      row = `<b>${keys[i]}</b>${jsonObject[keys[i]]}`;
      row = shouldIndent ? `&emsp;${row}` : row;
      resStr += row;
      if (i !== keys.length - 1) {
        resStr += '<br />';
      }
    }
  }
  return resStr;
};

export const updateTooltip = ({x, y, object}) => {
  const tooltip = document.getElementById('tooltip');
  if (object) {
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = buildTable(object);
  } else {
    tooltip.innerHTML = '';
  }
};
