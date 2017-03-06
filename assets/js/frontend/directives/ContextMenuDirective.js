(function () {
  'use strict';

  angular.module('interface')
    .directive('contextMenu', [function () {
      return {
        restrict: 'A',
        require: 'mdMenu',
        link: function (scope, element, attrs, menu) {

          var prev = {
            x: 0,
            y: 0
          };
          scope.$mdOpenContextMenu = function (event) {

            menu.offsets = function () {
              var mouse = {
                x: event.clientX,
                y: event.clientY
              };
              var offsets = {
                left: mouse.x - prev.x,
                top: mouse.y - prev.y
              };
              prev = mouse;

              return offsets;
            };

            menu.open(event);
          };
        }
      };
    }]);
    
})();
