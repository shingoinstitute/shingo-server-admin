/**
 * An AngularJS factory to expose the REST API
 * for managing the forever servers.
 */
(function(){
    'use strict';

    angular.module('dataLayer')
    .factory('servers', ['$http', servers]);

    function servers($http){
        return {

            /**
             * Get the forever server config.
             * Analagous to running less <config>
             * @param configPath :: The location of the config
             * @returns confgObj :: A JSON array of forever server configs
             */
            config: function(configPath){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/config',
                    data: {configPath: configPath}
                })
                .then(function(data){
                    if(data.data) return data.data;
                    else return [];
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            },

            /**
             * Adds a server config to the forever config file.
             * @param configPath :: The path to the config file.
             * @param server :: The config to add
             * @returns confgObj :: A JSON array of forever server configs
             */
            addServer: function(configPath, server){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/configAdd',
                    data: {configPath: configPath, server: server}
                })
                .then(function(data){
                    if(data.data) return data.data;
                    else return [];
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
            }, 

            /**
             * Get all running forever servers.
             * Analagous to running `forever list`
             * in the forever CLI.
             * @param uid :: The forever UID that identifes the server
             * @returns A $http promise that returns an array of servers
             */
            list: function(){
                return $http({
                    method: 'get',
                    dataType: 'json',
                    url: '/server/list',
                })
                .then(function(data){
                    if(data.data) return data.data;
                    else return [];
                })
                .catch(function(err){
                    console.error('Error: ',err);
                });
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
             * Stops all running servers.
             * Analagous to running `forever stopall`
             * in the forever CLI.
             * @returns A $http promise
             */
            stopall: function(){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: '/server/stopall',
                    data: {}
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
             * Restarts all running servers.
             * Analagous to running `forever restartall`
             * in the forever CLI.
             * @returns A $http promise
             */
            restartall: function(){
                return $http({
                    method: 'post',
                    dataType: 'json',
                    url: 'server/restartall',
                    data: {}
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