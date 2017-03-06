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
var fs = Promise.promisifyAll(require('fs-extra'));

module.exports = {
	
  /**
   * Load a log file and listen for new messages. Analagous to `tail -f <{name}.log>
   * @param uid :: Uid of the server
   * @param name :: name of the log file (ie name = /var/www/shingo-affiliates/info)
   * @returns file :: A JSON array of the lines of the log file. Also emits socket messages
   */
  loadAndListen: function(req, res){
    var uid = req.param('uid');
    var name = req.param('name');
    var logPath = path.normalize(name);
    var loc = logPath.length - logPath.search('\\.log');
    if(loc != 4) return res.badRequest("Need a file that ends in .log. Not " + loc + "\n" + logPath);

    sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Loading logs for " + uid + " at " + logPath});
    // Start a tail
    var tail
    
    try
    {
      tail = new Tail(logPath);
    }
    catch(err)
    {
      sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
      sails.log.error("Tail error: ", err);
    }

    tail.on("line", function(line){
      sails.io.emit(uid + " log line", line);
    });

    tail.on("error", function(err){    
      sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
      sails.log.error("Tail error: ", err);
    });
    
    // Load current log
    var log = [];

    var lineReader = readline.createInterface({
      input: fs.createReadStream(logPath)
    })

    lineReader.on('line', function(line){
      log.push(line);
    });

    lineReader.on('close', function(){
      sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Current logs for " + uid + " listening for more..."});
      return res.ok(log);
    });
  },

  /**
   * Clear the logs of a server. Analagous to rm -rf <name>.log
   * @param uid :: The server to clear logs for
   * @param name :: The name of the log file to clear
   * @returns NULL :: Emits socket messages
   */
  clear: function(req,res){
    var uid = req.param('uid');
    var name = req.param('name');
    var logPath = path.normalize(name);
    var loc = logPath.length - logPath.search('\\.log');
    if(loc != 4) return res.badRequest("Need a file that ends in .log. Not " + loc + "\n" + logPath);
    
    sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Clearing logs for " + uid + " at " + logPath});
    fs.outputFileAsync(logPath, "")
    .then(function(){
      sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Logs cleared for " + uid});
      return res.ok("File removed");
    })
    .catch(function(err){
      sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
      sails.log.error(err);
      return res.negotiate(err);
    });
  }
};

