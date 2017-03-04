// Pass in min array length (>=) to search in minArr attribute.
(function () {
  'use strict';

  angular.module('interface')
    .directive('minArr', function ($interpolate, $parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ngModelCtrl) {
          scope.$watch(attr.ngModel, function (newVal) {
            var length = attr.minArr;
            ngModelCtrl.$setValidity('minarr', newVal.length >= length);
          }, true);
        }
      };
    });
    
})();
