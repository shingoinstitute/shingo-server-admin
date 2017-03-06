/**
 * A service to interact with the API auth routes
 */
(function () {
  'use strict';

  angular.module('dataLayer')
    .factory('Auth', ['$http', function ($http) {
      // Get the user's profile
      return {
        getProfile: function () {
          return $http.get('/auth/me');
        }
      }
    }]);

})();
