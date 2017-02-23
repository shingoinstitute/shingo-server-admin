(function(){
    'use strict';

    /**
     * The core module for the Shingo Admin Server
     */
    angular.module('core', [
                            'ngRoute',         // View Routing
                            'ui'              // UI Components
                           ])
    .config(function($routeProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html'
        })
        .when('/config',{
            templateUrl: 'templates/config.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    });

})();