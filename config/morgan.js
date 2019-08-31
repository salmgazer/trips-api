const morgan = require('morgan');

// last stream is the one we want to use for morgan
const {stream} = require('./logger').streams.slice(-1)[0];

module.exports = morgan('combined', {stream});
