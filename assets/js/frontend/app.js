(function(){
    'use strict';

    /**
     * The core module for the Shingo Admin Server
     */
    angular.module('core', [
                            'ngRoute',         // View Routing
                            'ngMaterial',      // Angular Material
                            'angular-uuid',    // UUID generation
                            'angular-lodash',  // Lodash directives
                            'luegg.directives' // Scroll glue
                           ])
    .config(function($routeProvider, $mdThemingProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html'
        })
        .otherwise({
            redirectTo: '/'
        });

        var shingoRedMap = $mdThemingProvider.extendPalette('red',{
        '500': '#640921'
        });
        var shingoBlueMap = $mdThemingProvider.extendPalette('blue',{
        '500': '#003768'
        })

        $mdThemingProvider.definePalette('shingoBlue', shingoBlueMap);
        $mdThemingProvider.definePalette('shingoRed', shingoRedMap);
        $mdThemingProvider.theme('default')
        .primaryPalette('shingoRed', {'default':'500'})
        .accentPalette('shingoBlue', {'default': '500'});
    });

    angular.module('core')
    .constant('io', io);

    angular.module('core')
    .constant('_', _);
})();