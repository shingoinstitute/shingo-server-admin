/**
 * An AngularJS factory to expose the REST API
 * for managing the forever config file.
 */
(function () {
  'use strict';

  angular.module('dataLayer')
    .factory('Config', ['$http', Config]);

  function Config($http) {
    return {

      /**
       * Get the forever server config.
       * Analagous to running less <config>
       * @param configPath :: The location of the config
       * @returns confgObj :: A JSON array of forever server configs
       */
      config: function (configPath) {
        return $http({
            method: 'post',
            dataType: 'json',
            url: '/config/config',
            data: {
              configPath: configPath
            }
          })
          .then(function (data) {
            if (data.data) return data.data;
            else return [];
          })
      },

      /**
       * Adds a server config to the forever config file.
       * @param configPath :: The path to the config file.
       * @param server :: The config to add
       * @returns confgObj :: A JSON array of forever server configs
       */
      addServer: function (configPath, server) {
        return $http({
            method: 'post',
            dataType: 'json',
            url: '/config/configAdd',
            data: {
              configPath: configPath,
              server: server
            }
          })
          .then(function (data) {
            if (data.data) return data.data;
            else return [];
          })
      },

      removeServer: function (configPath, uid) {
        return $http({
            method: 'post',
            dataType: 'json',
            url: '/config/configRemove',
            data: {
              configPath: configPath,
              uid: uid
            }
          })
          .then(function (data) {
            if (data.data) return data.data;
            else return [];
          })
      }
    }
  }
})();
