// Pass in array to search in isIn attribute.
// NOTE: It needs to be the value not a scope ref.
(function () {
  'use strict';

  angular.module('interface')
    .directive('isIn', function ($interpolate, $parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ngModelCtrl) {
          scope.$watch(attr.ngModel, function (newVal) {
            var arr = JSON.parse(attr.isIn);
            ngModelCtrl.$setValidity('isin', !arr.length || arr.findIndex(function (el) {
              return el == newVal;
            }) == -1);
          }, true);
        }
      };
    });

})();
