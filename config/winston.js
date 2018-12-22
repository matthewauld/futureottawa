const level =  'debug';
var appRoot = require('app-root-path');

var winston = require('winston');

// define the custom settings for each transport (file, console)
var options = {
  file: {
    //level: 'error',
    filename: `${appRoot}/logs/app.log`,
  },
  console: {

  },
};

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`

logger.info("Starting Winston Logger")
module.exports = logger;
