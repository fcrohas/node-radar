angular.module('controllers').controller('SettingsCtrl', ['$scope', '$http', '$modalInstance',
  function($scope, $http, $modalInstance) {
      $scope.settings = {};
      $http.get('/rest/settings/read').success(function(data) {
          $scope.settings = data;
      });

      $scope.save = function(section) {
        $http.post('/rest/settings/write/'+section, $scope.settings).then(function() {
          $modalInstance.close();
        });
      };

      $scope.cancel = function() {
        $modalInstance.close();
      };
    }
  ])