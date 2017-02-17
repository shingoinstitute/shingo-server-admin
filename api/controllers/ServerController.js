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

  config: function (req, res) {
    var configPath = req.param("config");
    if (!configPath) return res.badRequest("No config parameter found.");
    fs.readJsonAsyn(configPath)
      .then(function (config) {
        return res.ok(config);
      })
      .catch(function (err) {
        return res.negotiate(err);
      });
  },

  list: function (req, res, next) {
    forever.listAsync(false)
      .then(function (servers) {
        return res.ok(servers);
      })
      .catch(function (err) {
        return res.negotiate(err);
      });
  },

  start: function (req, res) {
    var uid = req.param('uid');
    var file = req.param('file');
    var sourceDir = req.param('source');
    var env = req.param('env');
    var child = new(foreverMonitor.Monitor)(file, {
      uid: uid,
      cwd: sourceDir,
      sourceDir: sourceDir,
      env: env
    });

    child.on('error', function (err) {
      sails.io.emit(uid + ' error', err);
    });

    child.on('stop', function (err) {
      sails.io.emit(uid + ' stop', {
        message: "User stopped server " + uid
      });
    });

    child.on('exit', function (err) {
      sails.io.emit(uid + ' exit', {
        message: "Forever detected script, " + uid + ",  exited with code " + code
      });
    });

    child.on('restart', function (err) {
      sails.io.emit(uid + ' restart', {
        message: "Forever restarting script " + uid
      });
    });

    forever.startServer(child);
  },

  stop: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();
    forever.listAsync(false)
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });
        return forever.stop(index);
      })
      .then(function (listener) {
        listener.on('stop', function () {
          res.ok('Server ' + uid + ' has stopped');
        });
      })
      .catch(function (err) {
        return res.negotiate(err);
      })
  },

  restart: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();
    forever.listAsync(false).bind({})
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });
        this.server = servers[index];
        return forever.restart(index);
      })
      .then(function () {
        res.ok('Server ' + uid + ' has restarted');
      })
      .catch(function (err) {
        return res.negotiate(err);
      })
  },

  nuke: function (req, res) {
    var uid = req.param('uid');
    if (!uid) return res.badRequest();
    forever.listAsync(false).bind({})
      .then(function (servers) {
        var index = _.findIndex(servers, function (o) {
          return o.uid == uid;
        });
        this.index = index;
        this.server = servers[index];
        return fs.removeAsync(path.join(this.server.sourceDir, 'node_modules'));
      })
      .then(function () {
        var server = this.server;
        var index = this.index;
        var child = proc.spawn('npm', ['install'], {
          cwd: server.sourceDir
        });

        child.stdout.on('data', function (data) {
          sails.io.emit('server log', data.toString());
        })

        child.stderr.on('data', function (data) {
          sails.io.emit('server error log', data.toString());
        })

        child.on('close', function (code) {
          return forever.restart(index);
        })
      })
      .then(function () {
        res.ok('Server ' + uid + ' has been nuked and restarted');
      })
      .catch(function (err) {
        return res.negotiate(err);
      });
  }
};
