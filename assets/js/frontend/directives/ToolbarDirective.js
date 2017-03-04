(function () {
  'use strict';

  angular.module('interface')
    .directive('toolbar', function () {
      return {
        restrict: 'EA',
        templateUrl: 'templates/toolbar.tmpl.html',
        controller: 'ToolbarController',
        controllerAs: 'vm'
      }
    });

})();
