(function () {
  'use strict';

  angular.module('interface')
    .directive('serverConfig', function () {
      return {
        restrict: 'EA',
        scope: {
          server: '='
        },
        templateUrl: 'templates/serverConfig.tmpl.html',
        controller: 'ServerConfigController'
      }
    });

})();
