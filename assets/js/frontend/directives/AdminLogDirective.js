(function () {
  'use strict';

  angular.module('interface')
    .directive('adminLog', function () {
      return {
        restrict: 'EA',
        templateUrl: 'templates/adminLog.tmpl.html',
        controller: 'AdminLogController',
        controllerAs: 'adminLog'
      }
    });

})();
