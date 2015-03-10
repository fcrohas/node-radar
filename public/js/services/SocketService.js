var socketService = angular.module('SocketService', []);

socketService.factory('SocketService', ['$rootScope','$location','PlaneService', function ($rootScope,$location,PlaneService) {

  function isUndefinedOrNull(value) {
    return ((value == undefined) && (value == null));
  }

  function clone(obj) {
      if (null == obj || "object" != typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
  }

  var socket = io.connect($location.protocol()+'://'+$location.host()+':'+$location.port()+'/socket/flight');
  var planes = [];
  // Manage new plane into the list
  socket.on('add', function(msg) {
    //console.log(msg);
    var plane = clone(msg);
    plane.show = false;
    plane.description = '';
    plane.silhouette = '/img/SilhouettesLogos/FOLLOW%20ME.png';
    planes.push( plane );  
    // new plane added
    $rootScope.$broadcast('addPlane', plane);
    // Update silhouette and info async
    PlaneService.getInfo(plane.ICAO, function(data) {
        for(var id in planes) {
          var planeInfo = planes[id];                
        if (planeInfo.ICAO == data.ModeS) {
            planeInfo.description = data.Manufacturer+' '+data.ModelType+'('+data.Engines+')';
            planeInfo.Manufacturer = data.Manufacturer;
            planeInfo.ModelType = data.ModelType;
            planeInfo.Engines = data.Engines;
            if (data.DesignatorType!='N/A')
              planeInfo.silhouette = '/img/SilhouettesLogos/'+data.DesignatorType+'.png';
            $rootScope.$broadcast('updatePlane', planeInfo);
            break;
          }
        }
    });
    msg = null;    
  });
  // Manage plane changes
  socket.on('change', function(msg) {
    var found = false;
    for(var id in planes) {
      var plane = planes[id];                
      if (plane.ICAO == msg.ICAO) {
        // not of bound as we receive a signal
        var update =false;
        if ((!isUndefinedOrNull(msg.latitude)) && ((msg.latitude != plane.latitude) || (msg.longitude!=plane.longitude)))  {
          plane.latitude = msg.latitude;
          plane.longitude = msg.longitude;
          update = true;
        }
        if ((!isUndefinedOrNull(msg.altitude)) && (msg.altitude != plane.altitude)) {
          plane.altitude = msg.altitude;
          update = true;
        }
        // Update Icon
        if ((!isUndefinedOrNull(msg.track)) && (msg.track != plane.track)) {
          plane.track = msg.track;
          update = true;
        }
        if (update)
          $rootScope.$broadcast('updatePlane', plane);

        update = false;        

        if ((!isUndefinedOrNull(msg.ground_speed)) && (msg.ground_speed != plane.ground_speed)) {
          plane.ground_speed = msg.ground_speed;
          update = true;
        }
        if ((!isUndefinedOrNull(msg.vertical_rate)) && (msg.vertical_rate != plane.vertical_rate)) {
          plane.vertical_rate = msg.vertical_rate;
          update = true;
        }
        if ((!isUndefinedOrNull(msg.squawk)) && (msg.squawk != plane.squawk)) {
          plane.squawk = msg.squawk;
          update = true;
        }
        if ((!isUndefinedOrNull(msg.callsign)) && (msg.callsign != plane.callsign)) {
          plane.callsign = msg.callsign;
          update = true;
        }

        if (update)
          $rootScope.$broadcast('updateInfo', plane);

        break;

      }
    }
    msg = null;
  });
// Manage quality signal
  socket.on('quality', function(msg) {
    for(var id in planes) {
      var plane = planes[id];  
      if (plane.ICAO == msg.ICAO) {
        if (msg.quality != plane.quality) {
          plane.quality = msg.quality;
          $rootScope.$broadcast('qualityPlane', {ICAO : msg.ICAO, quality: plane.quality});
        }
        break;
      }
    }
    msg = null;
  });
  // Manage remove older plane
  socket.on('delete', function(msg) {
    for(var id in planes) {
      var plane = planes[id];   
      if (plane.ICAO == msg.ICAO) {
          // before delete
          $rootScope.$broadcast('deletePlane', {ICAO : msg.ICAO});
          planes.splice(id,1);
          break;    
      }
    }
    msg = null;
  });
  // Otherwise use custom update
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
          callback.apply(socket, args);
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
          if (callback) {
            callback.apply(socket, args);
          }
      });
    },
    getPlaneCount : function() {
      return planes.length;
    },
    getPlaneList : function() {
      return planes;
    }
  };
}]);