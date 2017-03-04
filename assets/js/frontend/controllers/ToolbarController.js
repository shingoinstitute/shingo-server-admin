(function () {
  'use strict';

  angular.module('interface')
    .controller('ToolbarController', ['$scope', ToolbarController]);

  function ToolbarController($scope) {
    var vm = this;
    vm.title = "Shingo Server Admin"
    $scope.$on("location change", function (ev, data) {
      vm.title = data;
    });

    $scope.vm = vm;
  }
  
})();
