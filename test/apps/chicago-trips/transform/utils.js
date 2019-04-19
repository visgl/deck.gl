import assert from 'assert';

export function parseColumn(column) {
  let value = null;
  try {
    value = JSON.parse(column);
  } catch (e) {
    value = column;
  }
  return value;
}

export function parseColumns(line) {
  /* will match:
    (
        ".*?"       double quotes + anything but double quotes + double quotes
        |           OR
        [^",\s]+    1 or more characters excl. double quotes, comma or spaces of any kind
    )
    (?=             FOLLOWED BY
        \s*,        0 or more empty spaces and a comma
        |           OR
        \s*$        0 or more empty spaces and nothing else (end of string)
    )
  */

  return line.match(/(".*?"|[^",\s]+|[,])(?=\s*,|\s*$)/g).map(col => (col === ',' ? '' : col));
}

export function getLineObject(header, line) {
  const columns = parseColumns(line);
  if (columns) {
    assert(columns.length === header.length);
  }
  return (
    header &&
    columns &&
    columns.reduce((res, column, j) => {
      res[header[j]] = parseColumn(column);
      return res;
    }, {})
  );
}

export function parseTime(time) {
  const [hours, minutes, seconds] = time.split(':');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
