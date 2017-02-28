(function(){
    'use strict';

    angular.module('ui')
    .directive('adminLog', function(){
        return {
            restrict: 'EA',
            templateUrl: 'templates/adminLog.tmpl.html',
            controller: 'AdminLogController',
            controllerAs: 'adminLog'
        }
    });
})();