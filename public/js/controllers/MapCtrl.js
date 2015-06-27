angular.module('controllers').controller('mapCtrl', ['$scope','$http','SocketService', '$filter', function($scope,$http,socket,$filter) { 

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
    }
  };

}]);