// https://github.com/verma/plasio/
// loadData: js/ui.js

import laslaz from './laslaz';

export function loadLazFile(url) {
  var oReq = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function(oEvent) {
      if (oReq.status == 200) {
        // console.log(oReq.getAllResponseHeaders());
        return resolve(new laslaz.LASFile(oReq.response));
      }
      reject(new Error("Could not get binary data"));
    };

    oReq.onerror = function(err) {
        reject(err);
    };

    oReq.send();
  }).catch(Promise.CancellationError, function(e) {
    oReq.abort();
    throw e;
  });
};

export function readLazData(lf, skip, callback) {
  return lf.open()
    .then(function() {
      lf.isOpen = true;
      return lf;
  }).then(function(lf) {
      return lf.getHeader().then(function(h) {
          console.log("got header");
          return [lf, h];
      });
  }).then(function(v) {
      var lf = v[0];
      var header = v[1];
      var Unpacker = lf.getUnpacker();

      var totalRead = 0;
      var totalToRead = (skip <= 1 ? header.pointsCount : header.pointsCount / skip);

      var reader = function() {
        var p = lf.readData(1000 * 1000, 0, skip);
        return p.then(function(data) {
            totalRead += data.count;
            var unpacker = new Unpacker(data.buffer, data.count, header);

            callback(unpacker, totalRead / totalToRead);

            if (data.hasMoreData && totalRead < totalToRead)
              return reader();
            else {
              header.totalRead = totalRead;
              header.versionAsString = lf.versionAsString;
              header.isCompressed = lf.isCompressed;
              return [lf, header];
            }
        });
      };

      // return the lead reader
      return reader();
  }).then(function(v) {
      var lf = v[0];
      // we're done loading this file
      // Close it
      return lf.close().then(function() {
          lf.isOpen = false;
          // trim off the first element (our LASFile which we don't really want to pass to the user)
          return v.slice(1);
      });
  }).catch(function(e) {
      // make sure the file is closed, if the file is open
      // close and then fail
      if (lf.isOpen) {
        return lf.close().then(function() {
            lf.isOpen = false;
            console.log("File was closed");
            throw e;
        });
      }
      throw e;
  });
}
