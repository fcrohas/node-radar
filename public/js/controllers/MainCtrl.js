angular.module('controllers').controller('mainCtrl', ['$scope', 'SocketService', function ($scope,socket) {
  var selectedPlane = '';

  $scope.connected = false;
  $scope.socket = socket;

  // Register general selected action
  $scope.$on('planeSelect', function(event, ICAO) { 
    // look for plane id to unselect
    if (selectedPlane != '') {
      $scope.$broadcast('planeUnSelected',selectedPlane);  
    }
    $scope.$broadcast('planeSelected',ICAO);
    selectedPlane = ICAO;    
  });  

  $scope.$on('planeUnSelect', function(event, ICAO) { 
    $scope.$broadcast('planeUnSelected',ICAO);  
    selectedPlane = '';
  });

  // Connect only once
  if ($scope.connected == false) {
    // Detect connection
    socket.on('connect', function() {
      $scope.connected = true;
    });

    // Detect dicconnect
    socket.on('disconnect', function() {
      $scope.connected = false;
    });
  }
  
}]);