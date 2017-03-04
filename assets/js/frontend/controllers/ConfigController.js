(function(){
    'use strict';

    angular.module('interface')
    .controller('ConfigController', ['$scope', '$rootScope', 'Server', 'Config', 'uuid', ConfigController]);

    function ConfigController($scope, $rootScope, Server, Config, uuid){
        var vm = this;
        vm.config = [];
        vm.newServer = {
            uid: uuid.v4(),
            file: 'app.js',
            source: '',
            env: []
        };

        vm.start = function(){
            var env = vm.newServer.env;
            var envDict = {};
            env.forEach(function(el){
                var split = el.split('=');
                envDict[split[0]] = split[1];
            });
            vm.newServer.env = envDict;
            console.log('Starting server:', vm.newServer);
            Server.start(vm.newServer)
            .then(function(data){
                console.log("Server started...");
                vm.newServer = {};
            })
            .catch(function(err){
                console.error("ERROR: ", err);
            });
        }

        vm.stopall = function(){
            Server.stopall()
            .then(function(){
                console.log("All servers stopped");
            })
            .catch(function(err){
                console.error("ERROR: ", err);
            });
        }

        vm.restartall = function(){
            Server.restartall()
            .then(function(){
                console.log("All servers restarted");
            })
            .catch(function(err){
                console.error("ERROR: ", err);
            });
        }

        function init(){
            Config.config('/var/www/servers.json')
            .then(function(config){
                vm.config = config;
            })
            .catch(function(err){
                console.error("ERROR: ", err);
            });
            $rootScope.$broadcast('location change', 'Configurations');
        }

        init();

        $scope.$on('config removed', function(ev, data){
            vm.config = vm.config.filter(function(el){ return el.uid !== data});
        });
    }
})();