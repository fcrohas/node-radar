angular.module('services').factory('PlaneService', ['$http', function($http) {
  function radians(n) {
    return n * (Math.PI / 180);
  }
  function degrees(n) {
    return n * (180 / Math.PI);
  }

  return {
      // Make gradient color between two color
    makeGradientColor : function(color1, color2, percent) {
      var newColor = {};
      function makeChannel(a, b) {
          return(a + Math.round((b-a)*(percent/100)));
      }
      function makeColorPiece(num) {
          num = Math.min(num, 255);   // not more than 255
          num = Math.max(num, 0);     // not less than 0
          var str = num.toString(16);
          if (str.length < 2) {
              str = "0" + str;
          }
          return(str);
      }
      newColor.r = makeChannel(color1.r, color2.r);
      newColor.g = makeChannel(color1.g, color2.g);
      newColor.b = makeChannel(color1.b, color2.b);
      newColor.cssColor = "#" + 
                          makeColorPiece(newColor.r) + 
                          makeColorPiece(newColor.g) + 
                          makeColorPiece(newColor.b);
      return(newColor);
    },
    getInfo: function(params) {
      return $http.get('/rest/aircraft/info/'+ params).then(function(response) {
        return response.data;   
      });
    },
    getTrackHistory: function(params) {
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