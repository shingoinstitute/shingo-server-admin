(function(){
    'use strict';

    angular.module('ui')
    .controller('ToolbarController', ['$scope', '$rootScope', '$location', ToolbarController]);

    function ToolbarController($scope, $rootScope, $location){
        var vm = this;
        vm.title = "Shingo Server Admin"
        $scope.$on("location change", function(ev, data){
            vm.title = data;
        });

        vm.go = function(path){
            $location.path(path);
        }

        $scope.vm = vm;
    }
})();