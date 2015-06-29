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
    coverage : [],
    helpClick : function() {
      $location.path("/partial/settings");
    },
    settingsClick : function() {
      $location.path("/partial/settings");
    },
    navClick : function() {
      $location.path("/partial/flight");
    }
  };

  $scope.sideNavMode = false;
  $http.get('/rest/coverage').then(function(res) {
    $scope.map.coverage = res.data;
  });


}]);