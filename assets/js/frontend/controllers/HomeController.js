(function () {
  'use strict';

  angular.module('interface')
    .controller('HomeController', ['$scope', '$rootScope', '$http', '$mdDialog', 'io', 'uuid', 'Server', 'Log', '_', HomeController]);

  function HomeController($scope, $rootScope, $http, $mdDialog, io, uuid, Server, Log, _) {
    var $Log = function (jsonString) {
      var obj = JSON.parse(jsonString);
      this.timestamp = obj.timestamp;
      this.level = obj.level;
      this.message = obj.message;
      this.stack = obj.stack;
      this.id = uuid.v4();
    }

    var vm = this;
    vm.servers = [];
    vm.logs = {};

    // Load forever servers that are running
    vm.loadServers = function () {
      return Server.list()
        .then(function (data) {
          vm.servers = data;
          vm.servers.forEach(function (s) {
            console.debug('server ' + s.uid, s);
            if (!vm.logs[s.uid])
              vm.logs[s.uid] = new Array();
            loadLogs(s);
          })
        })
        .catch(function (err) {
          console.error("ERROR LOADING SERVERS: ", err);
        });
    }

    // Start a new server
    vm.start = function (server) {
      var newServer = {};
      newServer.uid = server.uid;
      newServer.file = server.file;
      newServer.source = server.sourceDir;
      newServer.env = server.spawnWith.env || server.env;
      Server.start(newServer)
        .then(function () {
          vm.loadServers();
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }

    // Stop a server by UID
    vm.stop = function (uid) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to stop the server ' + uid + '?')
        .textContent('If you stop the server, ' + uid + ', it is gone for good (you have to manually start it). Continue at your own peril!')
        .ariaLabel('Stop')
        .ok('Really Stop It')
        .cancel('I changed my mind');

      $mdDialog.show(confirm)
        .then(function () {
          return Server.stop(uid);
        })
        .then(function () {
          vm.loadServers();
        })
        .catch(function (err) {
          if (err) console.error("ERROR: ", err);
        });
    }

    // restart a server by UID
    vm.restart = function (uid) {
      Server.restart(uid)
        .then(function () {
          console.debug("Server " + uid + " restarted.");
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }

    // 1. Remove 'node_modules' dir from server.sourceDir
    // 2. Run `npm install`
    // 3. Restart server
    vm.nuke = function (uid) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to NUKE the server ' + uid + '?')
        .textContent('If you nuke the server, ' + uid + ', it could have issues restarting. This may result in an interruption of service. Continue at your own peril!')
        .ariaLabel('Stop')
        .ok('NUKE IT!')
        .cancel('I changed my mind');

      $mdDialog.show(confirm)
        .then(function () {
          return Server.nuke(uid);
        })
        .then(function () {
          console.debug("Server " + uid + " nuked.");
        })
        .catch(function (err) {
          if(err) console.error("ERROR: ", err);
        });
    }

    vm.clear = function (server) {
      Log.clear({
          name: server.spawnWith.env["LOG_PATH"] + '/' + server.spawnWith.env["LOG_FILE"],
          uid: server.uid
        })
        .then(function () {
          vm.logs[server.uid] = new Array();
        })
        .catch(function (err) {
          console.error(err);
        });
    }

    vm.loadingLogs = {};

    function loadLogs(s) {
      vm.loadingLogs[s.uid] = true;
      Log.load({
          name: s.spawnWith.env["LOG_PATH"] + '/' + s.args[0],
          uid: s.uid
        })
        .then(function (log) {
          if (!log.length) return;
          log.forEach(function (l) {
            vm.logs[s.uid].push(new $Log(l));
          });
          vm.loadingLogs[s.uid] = false;
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        })
    }

    function init() {
      vm.loadServers()
        .then(function () {
          vm.servers.forEach(function (s, i) {
            console.debug("Listening for logs for server " + s.uid);
            io.socket.on(s.uid + ' log line', function (line) {
              vm.logs[s.uid].push(new Log(line));
              $scope.$apply();
            });
          });
        });

      $rootScope.$broadcast('location change', 'Servers');
    }

    init();
  };

})();
