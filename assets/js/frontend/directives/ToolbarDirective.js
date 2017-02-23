(function(){
    'use strict';

    angular.module('ui')
    .directive('toolBar', function(){
        return {
            restrict: 'EA',
            templateUrl: 'templates/toolbar.tmpl.html',
            controller: 'ToolbarController',
            controllerAs: 'vm'
        }
    });
})();