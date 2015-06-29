angular.module('controllers').controller('mapCtrl', ['$scope','$http','$location', 'SocketService', '$filter', function($scope,$http,$location,socket,$filter) { 

  $scope.socket = socket;
  $scope.map = {
    center: {
      latitude: 43.6139213,
      longitude: 4.0561698
    },
    zoom : 8,
    options: {
        draggable:true,
        disableDefaultUI: false,
        panControl: true,
        navigationControl: true,
        scrollwheel: true,
        scaleControl: true,
        streetViewControl: false,
        overviewMapControl: false,
        zoomControl: true,
        mapTypeControl: true          
    },
    settings: {
      coverage : false,
      trackplane : false,
      airports : false
    },
    coverage : [],
    airports : [],
    helpClick : function() {
      $location.path("/help/howto");
    },
    settingsClick : function() {
      $location.path("/viewsettings");
    },
    navClick : function() {
      $location.path("/flight");
    }
  };

  $scope.sideNavMode = false;
  $scope.$watch('map.settings.coverage', function(newValue, oldValue) {
    if (newValue) {
      $http.get('/rest/coverage').then(function(res) {
        $scope.map.coverage = res.data;
      });
    } else {
      $scope.map.coverage = [];
    }
  });

  $scope.$watch('map.settings.airports', function(newValue, oldValue) {
    if (newValue) {
      $http.get('/rest/airports').then(function(res) {
        $scope.map.airports = res.data;
      });
    } else {
      $scope.map.airports = [];
    }
  });

}]);