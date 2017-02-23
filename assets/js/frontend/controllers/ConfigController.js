(function(){
    'use strict';

    angular.module('ui')
    .controller('ConfigController', ['$scope', '$rootScope', 'servers', ConfigController]);

    function ConfigController($scope, $rootScope, servers){
        var vm = this;
        vm.config = [];

        function init(){
            servers.config('/var/www/servers.json')
            .then(function(config){
                vm.config = config;
            })
            .catch(function(err){
                console.error("ERROR: ", err);
            });
            $rootScope.$broadcast('location change', 'Configurations');
        }

        init();
    }
})();