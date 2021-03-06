angular.module('nodeRadar', ['ui.bootstrap','ngAnimate','ngRoute','controllers','services','directives','ngTouch'])
.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/flight', {
        templateUrl: 'partial/flight',
        controller: 'FlightCtrl'
      }).
      when('/flight/history', {
        templateUrl: 'partial/history',
        controller: 'HistoryCtrl'
      }).
      when('/viewsettings', {
        templateUrl: 'partial/viewsettings',
        controller: 'ViewSettingsCtrl'
      }).
      when('/help/:name', {
        templateUrl: 'partial/help',
        controller: 'HelpCtrl'
      }).
      when('/about/:name', {
        templateUrl: 'partial/about',
        controller: 'AboutCtrl'
      }).
      otherwise({
        redirectTo: '/flight'
      });
}]).directive('resize', function ($window) {
    return function (scope, element) {
        //console.log(element);
        scope.$watch( element[0].offsetHeight, function () {
          

        }, true);
    }
});

// declare module
angular.module('controllers',[]);

angular.module('services',[]);

angular.module('directives',[]);