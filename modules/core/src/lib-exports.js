// eslint-disable-next-line
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib.prod');
} else {
  module.exports = require('./lib');
}
