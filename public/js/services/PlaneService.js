angular.module('services').factory('PlaneService', ['$http', function($http) {
  function radians(n) {
    return n * (Math.PI / 180);
  }
  function degrees(n) {
    return n * (180 / Math.PI);
  }

  return {
    getInfo: function(params, callback) {
      return $http.get('/rest/aircraft/info/'+ params).then(function(response) {
        return response.data;   
      });
    },
    getTrackHistory: function(params, callback) {
      return $http.get('/rest/aircraft/history/'+ params).then(function(response) {
        return response.data;
      });
    },
    getBearing : function(startLat,startLong,endLat,endLong){
      startLat = radians(startLat);
      startLong = radians(startLong);
      endLat = radians(endLat);
      endLong = radians(endLong);

      var dLong = endLong - startLong;

      var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
      if (Math.abs(dLong) > Math.PI){
        if (dLong > 0.0)
           dLong = -(2.0 * Math.PI - dLong);
        else
           dLong = (2.0 * Math.PI + dLong);
      }

      return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
    }
  };
}]);