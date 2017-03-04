(function () {
  'use strict';

  angular.module('interface')
    .controller('ServerConfigController', ['$scope', '$mdDialog', 'Config', '_', ServerConfigController]);

  function ServerConfigController($scope, $mdDialog, Config, _) {
    $scope.isEditing = false;
    $scope.removeConfig = function () {
      console.log('Removing config', $scope.server);
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete this?')
        .textContent('If you delete the config, ' + $scope.server.uid + ', it is gone for good. Continue at your own peril!')
        .ariaLabel('Remove')
        .ok('Really Remove It')
        .cancel('I changed my mind');

      $mdDialog.show(confirm)
        .then(function () {
          Config.removeServer('/var/www/servers.json', $scope.server.uid)
            .then(function () {
              $scope.$emit('config removed', $scope.server.uid);
            })
            .catch(function (err) {
              console.error('ERROR: ', err);
            });
        }, function () {
          console.log('Remove cancelled.');
        });
    }

    $scope.saveServer = function () {
      Config.removeServer('/var/www/servers.json', $scope.server.uid)
        .then(function () {
          return configs.addServer('/var/www/servers.json', $scope.server);
        })
        .then(function () {
          console.log('server saved');
        })
        .catch(function (err) {
          console.error("ERROR: ", err);
        });
    }
  }
  
})();
