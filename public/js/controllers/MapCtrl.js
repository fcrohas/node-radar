angular.module('controllers').controller('mapCtrl', ['$scope','$http', 'uiGmapGoogleMapApi','uiGmapIsReady', 'SocketService', '$filter', function($scope,$http,GoogleMapApi,IsReady,socket,$filter) { 
  var googleMaps = {};

  $scope.socket = socket;
  
  // Setup google maps API
  GoogleMapApi.then(function(maps) {
      $scope.googleVersion = maps.version;
      maps.visualRefresh = true;
      googleMaps = maps;
  });

  // Update map settings  
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
          model.labelContent = "Squawk: " + model.squawk+"<br>Altitude: "+model.altitude+" m<br>Speed: "+model.ground_speed+" km/h";
          model.showWindow = true;
          model.labelVisible = true;
          //$scope.$apply();
        },
        mouseout: function (marker, eventName, model, args) {
           model.labelContent = " ";
           model.showWindow = false;
           model.labelVisible = false;
           //$scope.$apply();
        }
      }
    }  
  });
}]);