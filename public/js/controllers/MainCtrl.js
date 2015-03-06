var mainControllers = angular.module('mainCtrl', []);

mainControllers.controller('mainCtrl', ['$scope', 'SocketService', function ($scope,socket) {
  var selectedPlane = '';

  $scope.connected = false;
  $scope.client_count = 0;
  $scope.plane_count = socket.getPlaneCount();

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

    // Detect client count
    socket.on('client_count', function(count) {
      $scope.client_count = count;
    }); 
    // On plane added
    $scope.$on('addPlane', function(data) {
      $scope.plane_count = socket.getPlaneCount();
    })   
    // On plane added
    $scope.$on('deletePlane', function(data) {
      $scope.plane_count = socket.getPlaneCount();
    })   
  }
}]);