var menuControllers = angular.module('menuCtrl', []);

menuControllers.controller('FlightCtrl', ['$scope', '$http', 'SocketService',
    function ($scope, $http, socket) {
        $scope.$on('$viewContentLoaded', function(event) {
            $scope.planes = clone(socket.getPlaneList());
        });      
        // clone plane object
        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }
        $scope.planes = [];
        $scope.Selected = function() {
            //console.log('Selected plane ICAO '+this.plane.ICAO)
            if (!this.plane.show) {
              $http.get('/rest/flight/'+this.plane.ICAO).success(function(data) {
                $scope.planeinfo = data;
              });
              this.plane.show = true;
              $scope.$emit('planeSelect', this.plane.ICAO);
            } else {
              $scope.$emit('planeUnSelect', this.plane.ICAO);
              this.plane.show = false;
            }
        };        
        $scope.$on('planeSelected', function(event, ICAO) { 
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];   
            if (plane.ICAO == ICAO) {
              plane.show = true;
              $http.get('/rest/flight/'+ICAO).success(function(data) {
                $scope.planeinfo = data;
              });
              break;
            }
          }
        });
        $scope.$on('planeUnSelected', function(event, ICAO) { 
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];   
            if (plane.ICAO == ICAO) {
              plane.show = false;
              $scope.planeinfo = {};
              break;
            }
          }
        });

        $scope.$on('addPlane', function(event,msg) {
          var plane = clone(msg);
          $scope.planes.push(plane);
          msg = null;
        });
        $scope.$on('deletePlane', function(event,msg) {
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];   
            if (plane.ICAO == msg.ICAO) {
              $scope.planes.splice(id,1);
              break;
            }
          }
          msg = null;
        });
        $scope.$on('updateInfo', function(event,msg) {
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];   
            if (plane.ICAO == msg.ICAO) {
              $scope.planes[id].altitude = msg.altitude;
              $scope.planes[id].ground_speed = msg.ground_speed;
              $scope.planes[id].vertical_rate = msg.vertical_rate;
              $scope.planes[id].callsign = msg.callsign;
              $scope.planes[id].silhouette = msg.silhouette;
              break;
            }
          }
          msg = null;
        });
    }

  ]);

menuControllers.controller('FlightDetailCtrl', ['$scope', '$http',
    function ($scope, $http) {
      $scope.$on('planeSelected', function(event, ICAO) { 
        $http.get('/rest/flight/'+ICAO).success(function(data) {
          $scope.planeinfo = data;
        });
      });
      $scope.$on('planeUnSelected', function(event, ICAO) { 
          $scope.planeinfo = {};
      });
    }
]);

menuControllers.controller('HistoryCtrl', ['$scope', '$http', '$window',
  function($scope, $http, $window) {
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
    $scope.name = $routeParams.name;
    switch($routeParams.name) {
      case "noderadar" : $scope.Title = "ADSB-Radar"; break;
      case "nodejs" : $scope.Title = "NodeJS"; break;
      case "adsb" : $scope.Title = "ADS-B"; break;
    }
  }]);
