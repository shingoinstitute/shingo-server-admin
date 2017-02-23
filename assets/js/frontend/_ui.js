(function(){
    'use strict';

    angular.module('ui', [
        'dataLayer',            // Data Layer Factories
        'ngMaterial',      // Angular Material
        'angular-uuid',    // UUID generation
        'angular-lodash',  // Lodash directives
        'luegg.directives' // Scroll glue
    ])
    .config(function($mdThemingProvider){
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


    angular.module('ui')
    .constant('io', io);

    angular.module('ui')
    .constant('_', _);
})();