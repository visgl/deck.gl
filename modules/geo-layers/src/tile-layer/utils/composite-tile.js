export default class CompositeTile {
  constructor({tileset = [], zoomLevel}) {
    this.tileset = tileset;
    this.zoomLevel = zoomLevel;

    this.data = [];
    this.combinedData = [];

    // Remember to refresh aggregation when any tile loads its data
    this.waitForDataInTiles(this.tileset);
    // Perform aggregation
    // this.combineTiles();
  }

  getData() {
    const pendingData = Promise.all(this.tileset.map(tile => tile.data)).then(allData =>
      allData.flat()
    );

    return this.data.length ? this.data.flat() : pendingData;
  }

  waitForDataInTiles(pendingTiles) {
    pendingTiles.forEach(pendingTile => {
      const tileData = pendingTile.data;
      const dataStillPending = Boolean(tileData.then);

      if (!dataStillPending) {
        this.data.push(tileData);
        return;
      }

      tileData.then(loadedData => {
        this.data.push(loadedData);
      });
    });
  }
}
