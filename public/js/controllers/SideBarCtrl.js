angular.module('controllers').controller('sidebarCtrl', function ($scope) {
  $scope.show = true;
  $scope.toggleClass = '';
  $scope.toggle = function() {
    $scope.show = !$scope.show;
    $scope.toggleClass = $scope.show ? '' : 'toggled'; 
  }
});




