(function () {
  'use strict';

  angular.module('ui')
    .controller('HomeController', ['$scope', '$rootScope', '$http', 'io', 'uuid', 'servers', 'logs', '_', HomeController]);

  function HomeController($scope, $rootScope, $http, io, uuid, servers, logs, _) {
    var Log = function (jsonString) {
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
      return servers.list()
        .then(function (data) {
          vm.servers = data;
          vm.servers.forEach(function (s) {
            console.log("server logs: ", vm.logs[s.uid]);
            if(!vm.logs[s.uid])
                vm.logs[s.uid] = new Array();
            console.log("server logs 2: ", vm.logs[s.uid].length);            
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
      servers.start(newServer)
        .then(function () {
          vm.loadServers();
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }

    // Stop a server by UID
    vm.stop = function (uid) {
      servers.stop(uid)
        .then(function () {
          vm.loadServers();
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }

    // restart a server by UID
    vm.restart = function (uid) {
      console.log("restart called")
      servers.restart(uid)
        .then(function () {
          console.log("Server " + uid + " restarted.");
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }

    // 1. Remove 'node_modules' dir from server.sourceDir
    // 2. Run `npm install`
    // 3. Restart server
    vm.nuke = function (uid) {
      servers.nuke(uid)
        .then(function () {
          console.log("Server " + uid + " nuked.");
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        })
    }

    vm.clear = function(server){
      logs.clear({name: server.spawnWith.env["LOG_PATH"] + '/' + server.spawnWith.env["LOG_FILE"], uid: server.uid})
      .then(function(){
        vm.logs[server.uid] = new Array();
      })
      .catch(function(err){
        console.error(err);
      });
    }

    vm.loadingLogs = {};

    function loadLogs(s) {
      vm.loadingLogs[s.uid] = true;
      logs.load({
          name: s.spawnWith.env["LOG_PATH"] + '/' + s.spawnWith.env["LOG_FILE"],
          uid: s.uid
        })
        .then(function (log) {
          if (!log.length) return;
          log.forEach(function (l) {
            vm.logs[s.uid].push(new Log(l));
          });
          vm.loadingLogs[s.uid] = false;
          console.log("server logs 3: ", vm.logs[s.uid].length);
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        })
    }

    function init() {
      vm.loadServers()
        .then(function () {
          vm.servers.forEach(function (s, i) {
            console.log("Listening for logs for server " + s.uid);
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
