/*
 * Coordinate the layout of multiline text blocks in a 2d canvas context.
 *
 * A TextAtlasPainter can be used to draw text to a canvas context.
 * The main purpose is to be able to measure the text before drawing
 * allowing you to resize the canvas before drawing begins.
 *
 * Currently the painter has a fixed style of text and currently assumes
 * it can manage the entire canvas.
 *
 * Example:
 *   const canvas = ...;
 *   const painter = TextAtlasPainter(canvas.getContext('2d', 1000, 12));
 *   const regions = labels.map(text => painter.getTextBounds(text));
 *
 *   // Resize canvas
 *   const extents = textPainter.getExtents();
 *   canvas.width = extents.width;
 *   canvas.height = extents.height;
 *
 *   painter.setTextStyle();
 *   labels.forEach((text, index) => painter.drawText(text, regions[index]));
 *
 *   return canvas;
 */
export class TextAtlasPainter {
  constructor(context, maxWidth, size) {
    this.context = context;
    this.maxWidth = maxWidth;
    this.size = size;
    this.lineGap = Math.ceil(0.2 * size);

    // marker holds attributes such as nLines, x, y
    this.marker = [];
  }

  setTextStyle() {
    // Fixed settings for now for simplicity.  If
    // it needs to be configurable we'd expose it
    // in the constructor.
    this.context.font = `${this.size}px Helvetica,Arial,sans-serif`;
    this.context.fillStyle = '#000';
    this.context.textBaseline = 'hanging';
    this.context.textAlign = 'left';
  }

  // return canvas width, height
  getExtents() {
    const width = this.marker.reduce((v, el) => Math.max(v, el.x), 0);
    const lastRow = this.marker[this.marker.length - 1];
    let height = 0;

    if (lastRow) {
      height = lastRow.y + this._rowHeight(lastRow);
    }

    return {width, height};
  }

  /**
   * Return a rectangular marking region for 'strings'.
   * Useful to measure text so you can resize the canvas
   * before drawing.
   *
   * @param String label text
   * @returns {object} {x, y, width, height}
   */
  getTextBounds(strings) {
    const lines = strings.split('\n').map(l => l.trim());
    const lineWidths = lines.map(text => this.context.measureText(text).width);
    const maxWidth = Math.max(...lineWidths);

    return this._getMarker(lines.length, maxWidth);
  }

  /**
   * Draw strings to canvas. We will manage text rows
   * by the number of lines they contain and fill the canvas.
   *
   *  +---------------------+----------+
   *  | elt1 | elt2-------- | elt3     |
   *  +----------+----------+----------+
   *  | elt4.1-------------   | elt5.1 |
   *  | elt4.2-------------   | elt5.2 |
   *  +----------+----------+----------+
   *  | ...      | ...      | ...      |
   *
   *
   * @param String label text
   * @param {object} Top-left (x,y) location to start text
   * @returns {object} {x, y, width, height}
   */
  drawText(strings, {x, y}) {
    const lines = strings.split('\n').map(l => l.trim());
    lines.forEach(l => {
      this.context.fillText(l, x, y);
      y += this.size;
    });
  }

  /* Given the line count and width, reserve a region in an
   * existing row if space is available, or make a new row.
   * Advance the row marker appropriately.
   */
  _getMarker(nLines, width) {
    const rows = this.marker.filter(m => m.nLines === nLines);
    const row = rows.find(r => r.x + width < this.maxWidth);
    if (row) {
      return this._advanceMarker(row, width);
    }

    return this._newMarker(nLines, width);
  }

  /* Create a new row marker, return the region, and
   * advance the marker.
   */
  _newMarker(nLines, width) {
    const lastRow = this.marker[this.marker.length - 1];
    let y = 0;

    if (lastRow) {
      // Change y based on lastRow's position.
      y = lastRow.y + this._rowHeight(lastRow) + this.lineGap;
    }

    const row = {
      nLines,
      x: 0,
      y
    };

    this.marker.push(row);

    return this._advanceMarker(row, width);
  }

  /* Make a copy of the marker to return to caller
   * and advance the marker.
   */
  _advanceMarker(row, width) {
    const region = {
      x: row.x,
      y: row.y,
      width,
      height: this._rowHeight(row)
    };

    row.x += width;

    return region;
  }

  _rowHeight(row) {
    return row.nLines * this.size;
  }
}
