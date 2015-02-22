var menuControllers = angular.module('menuCtrl', []);

menuControllers.controller('FlightCtrl', ['$scope', '$http',
    function ($scope, $http) {

        $scope.Selected = function() {
            //console.log('Selected plane ICAO '+this.plane.ICAO)
            $http.get('/rest/flight/'+this.plane.ICAO).success(function(data) {
              $scope.planeinfo = data;
            });
            $scope.$emit('planeSelected', this.plane.ICAO);
        };        
    }

  ]);

menuControllers.controller('HistoryCtrl', ['$scope', '$http',
  function($scope, $http) {
    $scope.results = '';
    $scope.results.count = 0;
    $scope.results.rows = [];
    $scope.Search = function(value) {
      $http.get('/rest/aircraft/search/'+value).success(function(data) {
        $scope.results = data;
      });
    };
  }]);

menuControllers.controller('SettingsCtrl', ['$scope', '$http',
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
  ]);

menuControllers.controller('HelpCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);

menuControllers.controller('AboutCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);