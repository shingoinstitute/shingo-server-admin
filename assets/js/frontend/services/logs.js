(function(){
    'use strict';

    angular.module('core')
    .factory('logs', ['$http', logs]);

    function logs($http, options){
        return {

            /**
             * Load log and start watching for changes.
             * @param options :: {name: 'log name', uid: 'server uid'}
             */
            load: function(options){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/log/loadAndListen',
                    data: options
                }).then(function(data){
                    return data.data;
                })
            }
        }
    }
})();