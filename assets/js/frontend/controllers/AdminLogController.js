(function(){
    'use strict';

    angular.module('interface')
    .controller('AdminLogController', ['$scope', 'uuid', 'io', AdminLogController]);

    function AdminLogController($scope, uuid, io){
        var Log = function (jsonString) {
            var obj = JSON.parse(jsonString);
            this.timestamp = obj.timestamp;
            this.level = obj.level;
            this.message = obj.message;
            this.stack = obj.stack;
            this.id = uuid.v4();
        }

        $scope.adminLog = [];

        io.socket.on('server log', function (data) {
            $scope.adminLog.push(data);
                $scope.$apply();
        });

        $scope.clearAdmin = function(){
            $scope.adminLog = [];
        }
    }
})();