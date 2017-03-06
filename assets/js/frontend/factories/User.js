/**
 * Exposes methods to get the userProfile,
 * refresh the userProfile, and check user status
 */
(function () {
  'use strict';

  angular.module('dataLayer')
    .factory('User', ['Auth', function (Auth) {
      var userProfile = {};

      // Clear the user profile
      // by setting to empty obj
      var clearUserProfile = function () {
        userProfile = {};
      }

      // Fetch the user profile
      var fetchUserProfile = function () {
        return Auth.getProfile()
          .then(function (response) {
            clearUserProfile();

            // Add methods to refresh, check anonymity(!authenticated)
            // and authentication
            return angular.extend(userProfile, response.data, {
              $refresh: fetchUserProfile,

              $isAnonymous: function () {
                return !userProfile.authenticated;
              },

              $isAuthenticated: function () {
                return userProfile.authenticated;
              }
            });
          });
      };

      return fetchUserProfile();
    }]);
})();
