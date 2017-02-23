/**
 * ServerController
 *
 * @description :: Server-side logic for managing Servers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var forever = Promise.promisifyAll(require('forever'));
var foreverMonitor = require('forever-monitor');
var _ = require('lodash');
var path = require('path');
var fs = Promise.promisifyAll(require('fs-extra'));
var proc = Promise.promisifyAll(require('child_process'));

module.exports = {

  /**
   * Return the forever config file.
   * @param config :: The path to the forever config file
   * @returns configFile :: The JSON object representing the config file
   */
  config: function (req, res) {
    var configPath = req.param("configPath");
    if (!configPath) return res.badRequest("No config parameter found.");
    fs.readJsonAsync(configPath)
      .then(function (config) {
        return res.ok(config);
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.negotiate(err);
      });
  },

  configAdd: function(req, res){
    var configPath = req.param("configPath");
    var server = JSON.parse(req.param("server"));
    rs.readJsonAsync(configPath).bind({})
    .then(function(config){
      config.push(server);
      this.config = config;
      return rs.writeJsonAsync(configPath);
    })
    .then(function(){
      return res.created(this.config);
    })
    .catch(function(err){
      sails.log.error(err);
      sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
      return res.negotiate(err);
    });
  },

  /**
   * Return a list of running forever servers.
   * @returns servers :: A JSON array of forever servers
   */
  list: function (req, res, next) {
    forever.listAsync(false)
      .then(function (servers) {
        return res.ok(servers);
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.negotiate(err);
      });
  },

  /**
   * Starts a new forever server. Analagous to `forever start [options] <script>`
   * in the forever CLI.
   * @param uid :: A unique identifier
   * @param file :: The script to run
   * @param sourceDir :: The directory the script resides in
   * @param env :: A JSON dictionary of env variables
   * @returns NULL :: Emits socket messages
   */
  start: function (req, res) {
    var uid = req.param('uid');
    var file = req.param('file');
    var sourceDir = req.param('source');
    var env = req.param('env');

    // Create forever-monitor (aka server)
    var child = new(foreverMonitor.Monitor)(file, {
      uid: uid,
      cwd: sourceDir,
      sourceDir: sourceDir,
      env: env,
      ctime: new Date()
    });

    // Emit a socket message to '<some uid> error'
    child.on('error', function (err) {
      sails.io.emit(uid + ' error', err);
    });

    // Emit a socket message to '<some uid> stop'
    child.on('stop', function (err) {
      sails.io.emit(uid + ' stop', {
        message: "User stopped server " + uid
      });
    });

    // Emit a socket message to '<some uid> exit'
    child.on('exit', function (err) {
      sails.io.emit(uid + ' exit', {
        message: "Forever detected script, " + uid + ",  exited with code " + code
      });
    });

    // Emit a socket message to '<some uid> restart'
    child.on('restart', function (err) {
      sails.io.emit(uid + ' restart', {
        message: "Forever restarting script " + uid
      });
    });
    
    sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Starting server ' + uid});

    // Start the server
    forever.startServer(child);

    sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Server ' + uid + ' started at ' + new Date()});
    res.ok("Server started");
  },

  /**
   * Stops a running forever server. Analagous to `forever stop <uid>`
   * in the forver CLI.
   * @param uid :: The UID of the server to stop.
   * @returns NULL :: Emits socket messages
   */
  stop: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();

    // Find the server
    forever.listAsync(false)
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });

        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Stopping server ' + servers[index].uid});
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: JSON.stringify(servers[index])});
        
        // Stop the server
        return forever.stop(index);
      })
      .then(function (listener) {
        // Emit message on listener.stop
        listener.on('stop', function () {
          sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Server ' + uid + ' stopped at ' + new Date()});
          res.ok('Server ' + uid + ' has stopped');
        });
      })
      .catch(function (err) {        
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.negotiate(err);
      })
  },

  /**
   * Stops all running forever servers. Analagous to `forever stopall`
   * in the forever CLI
   * @returns servers :: A JSON array of the stopped servers
   */
  stopall: function(req,res){
    sails.io.emit('server log', {timestamp: new Date(), level: 'warn', message: 'Stopping All Servers!'});
    forever.stopAllAsync(false)
    .then(function(servers){
      sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'All servers have been stopped'});
      return res.ok(servers);
    })
    .catch(function(err){
      sails.log.error(err);
      sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
      return res.regotiate(err);
    });
  },

  /**
   * Restarts a running forever server. Analagous to `forever restart <uid>`
   * in the forever CLI.
   * @param uid :: The UID of the server to restart
   * @returns NULL :: Emits socket messages
   */
  restart: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();

    // Find the server
    forever.listAsync(false).bind({})
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });
        this.server = servers[index];
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Restarting server ' + servers[index].uid});
        
        // Restart the server
        return forever.restart(index);
      })
      .then(function () {
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Server ' + uid + ' restarted at ' + new Date()});
        res.ok('Server ' + uid + ' has restarted');
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.negotiate(err);
      })
  },

  /**
   * Restarts all running forever servers. Analagous to `forever restartall`
   * in the forever CLI.
   * @returns NULL :: Emits socket messages
   */
  restartAll: function(req, res){
    sails.io.emit('server log', {timestamp: new Date(), level: 'warn', message: 'Restarting All Servers!'});
      forever.restartAllAsync(false)
      .then(function(servers){
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'All servers have been restarted'});
        return res.ok(servers);
      })
      .catch(function(err){
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.regotiate(err);
      });
  },

  /**
   * Nukes a forever server. "Nuking" entails the following:
   *    1. Remove 'node_modules' directory from the servers sourceDir
   *    2. Run `npm install`
   *    3. Restart server
   * @param uid :: The UID of the server to nuke
   * @returns NULL :: Emits socket messages
   */
  nuke: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();

    // Find the server
    forever.listAsync(false).bind({})
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });
        this.index = index;
        this.server = servers[index];
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Nuking server ' + servers[index].uid})
        sails.io.emit('server log', {timestamp: new Date(), level: 'warn', message: "Removing node_modules folder in " + servers[index].sourceDir})
        
        // (1) Remove the 'node_modules' directory of the given server
        return fs.removeAsync(path.join(this.server.sourceDir, 'node_modules'));
      })
      .then(function () {
        var server = this.server;
        var index = this.index;
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Running `npm install` in " + server.sourceDir});
        
        // (2) Run `npm install`
        var child = proc.spawn('npm', ['install'], {
          cwd: server.sourceDir
        });

        // Emit messages on `npm install` stdout
        child.stdout.on('data', function (data) {
          sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: data.toString()});
        })

        // Emit messages on `npm install` stderr
        child.stderr.on('data', function (data) {
          var i = data.toString().search("WARN");
          if(data && data != "" && data != "\n")          
            sails.io.emit('server log', {timestamp: new Date(), level: (i >= 0 ? 'warn' : 'error'), stack: data.toString()});
        })

        // (3) Restart server on `npm install` close
        child.on('close', function (code) {
          sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: "Restarting Server: " + server.uid});
          forever.restart(index);
          sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Server ' + uid + ' restarted at ' + new Date()});
        })
        return res.ok('Server ' + uid + ' is being nuked and restarted');
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {timestamp: new Date(), level: 'error', message: JSON.stringify(err)});
        return res.negotiate(err);
      });
  }
};
