var productionManager = angular.module('nodeRadar', ['ui.bootstrap','uiGmapgoogle-maps','sidebarCtrl','navbarCtrl','ngRoute','mapCtrl','menuCtrl']); 

productionManager.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/flight/detail/:callsign', {
        templateUrl: 'partial/flight',
        controller: 'FlightCtrl'
      }).
      when('/flight', {
        templateUrl: 'partial/flight',
        controller: 'FlightCtrl'
      }).
      when('/flight/history/:callsign', {
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
}]);
