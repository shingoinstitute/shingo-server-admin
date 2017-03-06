/**
 * ConfigController
 *
 * @description :: Server-side logic for managing Configs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var _ = require('lodash');
var path = require('path');
var fs = Promise.promisifyAll(require('fs-extra'));
var proc = Promise.promisifyAll(require('child_process'));

module.exports = {

  /**
   * Return the forever config file.
   * @param configPath :: The path to the forever config file
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
        sails.io.emit('server log', {
          timestamp: new Date(),
          level: 'error',
          message: JSON.stringify(err)
        });
        return res.negotiate(err);
      });
  },

  /**
   * Add a server to the config file.
   * @param configPath :: The path to the forever config file
   * @param server :: The object to add to the config file
   */
  configAdd: function (req, res) {
    var configPath = req.param("configPath");
    var server = req.param("server");
    fs.readJsonAsync(configPath).bind({})
      .then(function (config) {
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: 'Adding config ' + server.uid});  
        config.push(server);
        this.config = config;
        return fs.writeJsonAsync(configPath, config);
      })
      .then(function () {
        sails.io.emit('server log', {timestamp: new Date(), level: 'info', message: server.uid + ' added to config...'});            
        return res.created(this.config);
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {
          timestamp: new Date(),
          level: 'error',
          message: JSON.stringify(err)
        });
        return res.negotiate(err);
      });
  },

  /**
   * Remove a config from the config file
   * @param configPath :: The path to the forever config file
   * @param uid :: The UID of the config to remove
   */
  configRemove: function (req, res) {
    var configPath = req.param('configPath');
    var uid = req.param('uid');
    fs.readJsonAsync(configPath).bind({})
      .then(function (config) {
        sails.io.emit('server log', {
          timestamp: new Date(),
          level: 'info',
          message: "Removing server, " + uid + " from config at " + configPath
        })
        config = _.differenceBy(config, [{
          uid: uid
        }], 'uid');
        this.config = config;
        return fs.writeJsonAsync(configPath, config);
      })
      .then(function () {
        sails.io.emit('server log', {
          timestamp: new Date(),
          level: 'info',
          message: uid + ' has been removed...'
        });
        return res.ok(this.config);
      })
      .catch(function (err) {
        sails.log.error(err);
        sails.io.emit('server log', {
          timestamp: new Date(),
          level: 'error',
          message: JSON.stringify(err)
        });
        return res.negotiate(err);
      });
  }
};
