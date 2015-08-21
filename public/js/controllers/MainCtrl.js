angular.module('controllers').controller('mainCtrl', ['$scope', 'SocketService', function ($scope,socket) {

  $scope.socket = socket;
  $scope.user = {search:''};
  // $scope.search = {type:''};
  
}]);