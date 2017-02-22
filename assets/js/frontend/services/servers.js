/**
 * An AngularJS factory to expose the REST API
 * for managing the forever servers.
 */
(function(){
    'use strict';

    angular.module('core')
    .factory('servers', ['$http', servers]);

    function servers($http){
        return {

            /**
             * Get all running forever servers.
             * Analagous to running `forever list`
             * in the forever CLI.
             * @param uid :: The forever UID that identifes the server
             * @returns A $http promise that returns an array of servers
             */
            getAll: function(){
                return $http({
                    method: 'get',
                    dataType: 'json',
                    url: '/server/list',
                })
                .then(function(data){
                    if(data.data) return data.data;
                    else return [];
                })
            },

            /**
             * Start a new forever server.
             * Analagous to running `forever start`
             * in the forever CLI.
             * @param server :: {uid: 'A uid', file: 'The script to start', source: 'Server sourceDir', env: 'env variables to load'}
             */
            start: function(server){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/start',
                    data: server
                })
                .then(function(data){
                    console.log('Message: ', data.data);
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            },

            /**
             * Stop the given server.
             * Analagous to running `forever stop <uid>`
             * in the forever CLI.
             * @param uid :: The forever UID that identifes the server
             * @returns A $http promise
             */
            stop: function(uid){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/stop',
                    data: {uid: uid}
                })
                .then(function(data){
                    console.log('Message: ', data.data);
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            },

            /**
             * Restart the given server.
             * Analagous to running `forever restart <uid>`
             * in the forever CLI.
             * @param uid :: The forever UID that identifes the server
             * @returns A $http promise
             */
            restart: function(uid){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/restart',
                    data: {uid: uid}
                })
                .then(function(data){
                    console.log('Message: ', data.data);
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            },

            /**
             * "Nuke" the given server.
             * "Nuking" entails:
             *   1. Remove 'node_modules' directory
             *   2. Run `npm install`
             *   3. Restart server
             * @param uid :: The forever UID that identifes the server
             * @returns A $http promise
             */
            nuke: function(uid){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/nuke',
                    data: {uid: uid}
                })
                .then(function(data){
                    console.log('Message: ', data.data);
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            }
        }
    }
})();