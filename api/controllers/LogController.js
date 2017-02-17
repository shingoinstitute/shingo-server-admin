/**
 * LogController
 *
 * @description :: Server-side logic for managing Logs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var forever = Promise.promisifyAll(require('forever'));
var Tail = require('tail').Tail;
var path = require('path');
var readline = require('readline');
var fs = require('fs-extra');

module.exports = {
	
  loadAndListen: function(req, res){
    var uid = req.param('uid');
    var logPath = path.normalize(path.join(process.env.LOG_PATH, (req.param("name") + ".log")));
    sails.log.debug('uid: ', uid);
    sails.log.debug('logPath: ', logPath);

    var tail = new Tail(logPath);
    var linereader = readline.createInterface({
      input: fs.createReadStream(logPath)
    });

    function logLine(line){
      sails.log.debug("Logs: ", line);
      sails.io.emit(uid + " log line", line);
    }

    linereader.on("line", logLine);

    tail.on("line", logLine);

    tail.on("error", function(err){
      sails.log.error("Tail error: ", err);
    });

    res.ok();
  }

};

