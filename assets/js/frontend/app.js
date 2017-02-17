(function(){
    'use strict';

    angular.module('core', ['ngRoute', 'angular-uuid', 'luegg.directives'])
    .config(function($routeProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    });

    angular.module('core')
    .constant('io', io);

    angular.module('core')
    .controller('HomeController', ['$scope', '$http', 'io', 'uuid', function($scope, $http, io, uuid){
        var Log = function(jsonString){
            var obj = JSON.parse(jsonString);
            this.timestamp = obj.timestamp;
            this.level = obj.level;
            this.message = obj.message;
            this.stack = obj.stack;
            this.id = uuid.v4();
        }

        io.socket.on('server log', function(data){
            console.log("Server log: ", data);
        });

        io.socket.on('server error log', function(data){
            console.log("Server error log: ", data);
        });

        var vm = this;

        $http({
            method: 'get',
            dataType: 'json',
            url: '/server/list',
        })
        .then(function(data){
            vm.servers = data.data;
            vm.logs = {};
            if(vm.servers)
                vm.servers.forEach(function(s, i){
                    vm.logs[s.uid] = new Array();
                    io.socket.get('/log/loadAndListen?name=affiliates-info&uid=' + s.uid, function(data, response){
                        console.log("Listening for logs for server " + s.uid);
                        var count = 0;
                        io.socket.on(s.uid + ' log line', function(line){
                            vm.logs[s.uid].push(new Log(line));
                            count += 1;
                            $scope.$apply();
                        });
                    });
                })
            else
                vm.servers = [];
        })
        .catch(function(err){
            console.log("ERROR LINE 26: ", err);
        });
        vm.stop = function(uid){
            $http({
                method: 'get',
                dataType: 'json',
                url: '/server/stop?uid=' + uid
            })
            .then(function(data){
                console.log('Message: ', data.data);
            })
            .catch(function(err){
                console.error('Error: ',err);
            });
        }

        vm.restart = function(uid){
                        $http({
                method: 'get',
                dataType: 'json',
                url: '/server/restart?uid=' + uid
            })
            .then(function(data){
                console.log('Message: ', data.data);
            })
            .catch(function(err){
                console.error('Error: ',err);
            });
        }
        vm.nuke = function(uid){
                        $http({
                method: 'get',
                dataType: 'json',
                url: '/server/nuke?uid=' + uid
            })
            .then(function(data){
                console.log('Message: ', data.data);
            })
            .catch(function(err){
                console.error('Error: ',err);
            });
        }
    }]);
})();