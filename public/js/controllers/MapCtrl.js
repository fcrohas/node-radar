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
      markers : [],
      clusterOptions: {
            title: 'Hi I am a Cluster!', gridSize: 60, ignoreHidden: true, minimumClusterSize: 2
      },
      markersEvents : {
        mouseover: function (marker, eventName, model, args) {
          model.options.labelContent = "Squawk: " + model.squawk+"<br>Altitude: "+model.altitude+" m<br>Speed: "+model.ground_speed+" km/h";
          model.showWindow = true;
          $scope.$apply();
        },
        mouseout: function (marker, eventName, model, args) {
           model.options.labelContent = " ";
           model.showWindow = false;
           $scope.$apply();
        }
      }
    }  
  });
  
  IsReady.promise(2).then(function (instances) {
    instances.forEach(function(inst){
      inst.map.ourID = inst.instance;
    });
  }); 

  var origCenter = {latitude: $scope.map.center.latitude, longitude: $scope.map.center.longitude};

}]);