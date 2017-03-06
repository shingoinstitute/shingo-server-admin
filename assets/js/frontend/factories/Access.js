(function () {
  'use strict';

  angular.module('dataLayer')
    .factory('Access', ["$q", "User", function ($q, User) {

      var Access = {
        OK: 200,

        REDIRECT: 301,

        UNAUTHORIZED: 401,

        FORBIDDEN: 403,

        isAnonymous: function () {
          return User.then(function (user) {
            if (user.$isAnonymous()) {
              return $q.resolve(Access.OK);
            } else if(user.$isAuthenticated()) {
              return $q.reject(Access.REDIRECT);
            } else {
              return $q.reject(Access.FORBIDDEN);
            }
          });
        },

        isAuthenticated: function () {
          return User.then(function (user) {
            if (user.$isAuthenticated()) {
              return $q.resolve(Access.OK);
            } else {
              return $q.reject(Access.UNAUTHORIZED);
            }
          });
        }
      };

      return Access;
    }]);
})();
