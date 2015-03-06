var planeService = angular.module('PlaneService', []);

planeService.factory('PlaneService', ['$http', function($http) {
  return {
    getInfo: function(params, callback) {
      $http.get('/rest/aircraft/info/'+ params).
        success(function(data, status) {
          callback(data, status);
        }).
        error(function(error, status) {
          callback(error, status);
        });
    },
    getTrackHistory: function(params, callback) {
      $http.get('/rest/aircraft/history/'+ params).
        success(function(data, status) {
          callback(data, status);
        }).
        error(function(error, status) {
          callback(error, status);
        });
    },
  };
}]);