var mapControllers = angular.module('mapCtrl', []); 

mapControllers.controller('mapCtrl', ['$scope','$http', '$timeout','uiGmapGoogleMapApi','uiGmapIsReady', function($scope,$timeout,$http,GoogleMapApi,IsReady) { 

  GoogleMapApi.then(function(maps) {
      $scope.googleVersion = maps.version;
      maps.visualRefresh = true;
  });
  
  angular.extend($scope, {
    map : {
      show : true,
      control: {},
      version: "unknown",
      center: {
        latitude: 43.6139213,
        longitude: 4.0561698
      },
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
      zoom: 8,
      refresh: function () {
        $scope.map.control.refresh(origCenter);
      }, 
      markers : []
    }  
  });
  
  IsReady.promise(2).then(function (instances) {
    instances.forEach(function(inst){
      inst.map.ourID = inst.instance;
    });
  }); 

  var origCenter = {latitude: $scope.map.center.latitude, longitude: $scope.map.center.longitude};

}]);