/**
 * 
 * This module controls all things dealing with interfacing
 * with the users of the application.
 * 
 */
(function () {
  'use strict';

  angular.module('interface', [
      'ui.router', // View Routing
      'dataLayer', // Data Layer Factories
      'ngMaterial', // Angular Material
      'angular-uuid', // UUID generation
      'angular-lodash', // Lodash directives
      'ngMessages', // Angular Messages
      'luegg.directives' // Scroll glue
    ])
    .config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
          'default': '500'
        })
        .accentPalette('grey', {
          'default': '600'
        });

      // Login state
      // Come here if the user isAnonymous (not authenticated)
      var loginState = {
        name: 'login',
        url: '/login',
        templateUrl: 'templates/login.html',
        resolve: {
          access: ["Access", function (Access) {
            return Access.isAnonymous();
          }]
        }
      }

      // Home state
      // Come here for servers and only if user isAuthenticated
      var homeState = {
        name: 'servers',
        url: '/',
        templateUrl: 'templates/home.html',
        resolve: {
          access: ["Access", function (Access) {
            return Access.isAuthenticated();
          }]
        }
      }

      // Config state
      // Come here for configs and only if user isAuthenticated
      var configState = {
        name: 'configs',
        url: '/config',
        templateUrl: 'templates/config.html',
        resolve: {
          access: ["Access", function (Access) {
            return Access.isAuthenticated();
          }]
        }
      }

      // Forbidden state
      // Don't come here. No really, it should never reach this state...
      var forbiddenState = {
        name: 'forbidden',
        url: '/403',
        template: '<md-content><h1>403</h1>You are not allowed to be here! Try logging in again...</md-content>'
      }

      // Register the above states
      $stateProvider.state(loginState);
      $stateProvider.state(homeState);
      $stateProvider.state(configState);
      $stateProvider.state(forbiddenState);

      // Go home if no valid state provide in URL
      $urlRouterProvider.otherwise('/');
    });

  // Add state to $rootScope
  // Listen for Access error (via $stateChangeError)
  // Go to proper state or log if you don't know what to do
  angular.module('interface')
    .run(['$rootScope', 'Access', '$state', function ($rootScope, Access, $state) {
      $rootScope.$state = $state;
      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        console.debug("$stateChangeError", Access, error);
        if (error == Access.UNAUTHORIZED)
          $state.go('login');
        else if (error == Access.REDIRECT)
          $state.go('servers');
        else if (error == Access.FORBIDDEN)
          $state.go('forbidden');
        else
          console.warn("Uncaught $stateChangeError!", Access, error);
      });
    }]);

  // Make Sails.Socket.io available
  // throughout the interface module
  angular.module('interface')
    .constant('io', io);

  // Make lodash.js available
  // throughout the interface module
  angular.module('interface')
    .constant('_', _);
    
})();
