var radarManager = angular.module('nodeRadar', ['ui.bootstrap','uiGmapgoogle-maps','sidebarCtrl','navbarCtrl','ngRoute','mapCtrl','menuCtrl','mainCtrl','SocketService','PlaneService']); 

radarManager.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/flight/detail/:callsign', {
        templateUrl: 'partial/flightdetail',
        controller: 'FlightDetailCtrl'
      }).
      when('/flight/detail', {
        templateUrl: 'partial/flightdetail',
        controller: 'FlightDetailCtrl'
      }).
      when('/flight', {
        templateUrl: 'partial/flight',
        controller: 'FlightCtrl'
      }).
      when('/flight/history', {
        templateUrl: 'partial/history',
        controller: 'HistoryCtrl'
      }).
      when('/settings', {
        templateUrl: 'partial/settings',
        controller: 'SettingsCtrl'
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
}]).config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
    GoogleMapApi.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });
}]).directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.style = function (size) {
                return { 
                    'height': (newValue.h - size) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            //scope.$apply();
        });
    }
});
