angular.module('controllers').controller('FlightCtrl', ['$scope', 'SocketService',
    function ($scope, socket) {
        $scope.socket = socket;
        $scope.getPlaneInfo = function(plane) {
          // Avoid selection twice
          if (!plane.show) {
            socket.getPlaneInfo(plane).then(function(info) {
                $scope.planeInfo = info;
            });
          }
        };
    }

  ]).controller('HistoryCtrl', ['$scope', '$http', '$window',
  function($scope, $http, $window) {
    $scope.results = '';
    $scope.results.count = 0;
    $scope.results.rows = [];
    $scope.Search = function(value) {
      $http.get('/rest/aircraft/search/'+value).success(function(data) {
        $scope.results = data;
      });
    };
  }]).controller('SettingsCtrl', ['$scope', '$http',
  function($scope, $http) {
      $scope.settings = {};
      $http.get('/rest/settings/read/SBS').success(function(data) {
          $scope.settings.SBS = data;
      });
      $http.get('/rest/settings/read/Proxy').success(function(data) {
          $scope.settings.Proxy = data;
      });
      $http.get('/rest/settings/read/Plane').success(function(data) {
          $scope.settings.Plane = data;
      });
    }
  ]).controller('HelpCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]).controller('AboutCtrl', ['$scope', '$routeParams', '$http', 
  function($scope, $routeParams, $http) {
    $scope.name = $routeParams.name;
    switch($routeParams.name) {
      case "noderadar" : $scope.Title = "ADSB-Radar"; break;
      case "nodejs" : $scope.Title = "NodeJS"; break;
      case "adsb" : $scope.Title = "ADS-B"; break;
    }
  }]);
