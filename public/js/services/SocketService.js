angular.module('services').factory('SocketService', ['$http','$location','PlaneService', function ($http,$location,PlaneService) {
  var client_count = 0;
  var in_view = 0;
  function isUndefinedOrNull(value) {
    return ((value == undefined) && (value == null));
  }
/*
  function clone(obj) {
      if (null == obj || "object" != typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
  }
*/
  var socket = io.connect($location.protocol()+'://'+$location.host()+':'+$location.port()+'/socket/flight');
  var planes = [];
  // Manage new plane into the list
  socket.on('add', function(plane) {
    //console.log(msg);
    plane.show = false;
    plane.description = '';
    plane.silhouette = '/img/SilhouettesLogos/FOLLOW%20ME.png';
    plane.icon = {
        path: 'm -79.118479,-9.2641052 c -1.437381,-10.4868878 -3.628647,-7.4387398 28.329918,-39.4083068 l 28.893679,-28.903634 -0.05168,-6.562443 c -0.02846,-3.609347 -0.289505,-42.566551 -0.580197,-86.571581 -0.290684,-44.00502 -0.86167,-80.00913 -1.268843,-80.00913 -0.407183,0 -18.470116,5.37835 -40.139852,11.95189 l -39.399522,11.9519 -56.53776,31.98713 c -31.09575,17.59294 -57.09049,31.77504 -57.76606,31.5158 -1.44923,-0.55613 -1.46499,-1.27875 -0.33034,-15.1547 0.47845,-5.85109 1.31636,-11.73046 1.86202,-13.06528 0.63418,-1.55134 15.58773,-14.33018 41.44777,-35.41996 22.25061,-18.14616 48.91922,-40.39188 59.26359,-49.43493 l 18.807931,-16.44192 0.03076,-7.61793 c 0.01693,-4.18987 0.291552,-12.46782 0.610286,-18.39546 l 0.579496,-10.77752 6.052565,0 c 6.84458,0 5.92119,-1.17382 8.329283,10.58838 0.743061,3.62946 1.474819,6.72281 1.626132,6.87412 0.151312,0.15131 1.689731,-0.22515 3.41869,-0.83657 1.916363,-0.6777 12.648695,-9.57151 27.491334,-22.78189 l 24.347742,-21.67019 0.631642,-40.69695 0.631642,-40.69694 4.784183,-23.83137 4.784183,-23.83136 4.8536951,-8.21671 c 7.63187856,-12.91983 8.9959789,-12.90806 16.4639473,0.14198 4.5028256,7.86855 4.5440576,8.01211 9.3566006,32.57388 l 4.833864,24.6705 0.560782,39.53775 0.560782,39.53776 24.368442,21.63266 c 21.743025,19.302 29.425994,25.10999 31.057702,23.47827 0.384292,-0.38428 1.029259,-3.14425 2.865542,-12.26231 l 1.02659,-5.09753 6.016545,0 6.016554,0 0.56955,5.44921 c 0.313254,2.99707 0.596917,11.27502 0.630365,18.39545 l 0.06082,12.94624 17.840911,15.51424 c 9.81249,8.53283 36.21474,30.38394 58.67166,48.55802 22.45692,18.17407 41.68495,34.22587 42.72895,35.67066 1.52152,2.10559 2.01125,4.43248 2.46791,11.72587 0.31334,5.00445 0.79289,10.99219 1.06567,13.30611 0.38551,3.27013 0.1958,4.3223 -0.85184,4.72431 -0.81235,0.31172 -23.9419,-12.21053 -58.22032,-31.52028 l -56.87255,-32.03747 -39.500439,-11.91569 c -21.725241,-6.55363 -39.821907,-11.9157 -40.214816,-11.9157 -0.3929,0 -0.951927,35.60517 -1.242274,79.12261 -0.290346,43.51743 -0.585658,82.504213 -0.656243,86.637294 l -0.128343,7.514688 29.092758,28.510841 29.092757,28.510841 -0.416446,7.193916 c -0.229043,3.956662 -0.633876,7.4113459 -0.899622,7.6770914 -0.265745,0.2657456 -15.527951,-3.1257729 -33.916027,-7.5367004 -18.388076,-4.410937 -33.978093,-8.019877 -34.6444963,-8.019877 -0.6663941,0 -3.1231134,3.177351 -5.4593624,7.060786 -2.336249,3.883435 -4.44719584,7.070042 -4.69099098,7.0813541 -0.24379512,0.011259 -2.17364212,-2.9665791 -4.28854282,-6.6175221 -2.1149007,-3.650952 -4.2034007,-6.63809 -4.6411061,-6.63809 -0.4377054,0 -15.7240514,3.590438 -33.9696624,7.97875 -18.245611,4.388313 -33.556407,7.9787506 -34.023989,7.9787506 -0.467581,0 -1.103842,-1.8509016 -1.413914,-4.1131078 z',
        fillColor: '#1C1C1C',
        fillOpacity: 1.0,
        scale: 0.05,
        strokeColor: '#1C1C1C',
        rotation: plane.track,
        strokeWeight: 1
    };
    if ((plane.latitude != null) && (plane.longitude != null)) {
      in_view += 1;
    }
    plane.onClick = this.getPlaneInfo;
    planes.push( plane );  
    // new plane added
    //$rootScope.$broadcast('addPlane', plane);
    // Update silhouette and info async
    PlaneService.getInfo(plane.ICAO).then(function(data) {
        angular.forEach(planes, function(planeInfo) {
          if (planeInfo.ICAO == data.ModeS) {
              planeInfo.description = data.Manufacturer+' '+data.ModelType+'('+data.Engines+')';
              planeInfo.Manufacturer = data.Manufacturer;
              planeInfo.ModelType = data.ModelType;
              planeInfo.Engines = data.Engines;
              if (data.DesignatorType!='N/A')
                planeInfo.silhouette = '/img/SilhouettesLogos/'+data.DesignatorType+'.png';
              //$rootScope.$broadcast('updatePlane', planeInfo);
              //break;
            }
        });
    });
    //console.log(planes);
    //msg = null;    
  });
  // Manage plane changes
  socket.on('change', function(msg) {
    angular.forEach(planes, function(plane) {
      if (plane.ICAO == msg.ICAO) {
        // not of bound as we receive a signal
        //var update =false;
        if ((!isUndefinedOrNull(msg.latitude)) && ((msg.latitude != plane.latitude) || (msg.longitude!=plane.longitude)))  {
          plane.latitude = msg.latitude;
          plane.longitude = msg.longitude;
          //console.log(msg.track);
          /*if (msg.track == undefined) {
            plane.track = PlaneService.getBearing(plane.latitude, plane.longitude, msg.latitude, msg.longitude);            
            plane.icon.rotation = plane.track;
          }*/
          //update = true;
        }
        if ((!isUndefinedOrNull(msg.altitude)) && (msg.altitude != plane.altitude)) {
          plane.altitude = msg.altitude;
          //update = true;
        }
        // Update Icon
        if ((!isUndefinedOrNull(msg.track)) && (msg.track != plane.track)) {
          plane.track = msg.track;
          plane.icon.rotation = plane.track;
          //update = true;
        }
        //if (update)
        //  $rootScope.$broadcast('updatePlane', plane);

        //update = false;        

        if ((!isUndefinedOrNull(msg.ground_speed)) && (msg.ground_speed != plane.ground_speed)) {
          plane.ground_speed = msg.ground_speed;
          //update = true;
        }
        if ((!isUndefinedOrNull(msg.vertical_rate)) && (msg.vertical_rate != plane.vertical_rate)) {
          plane.vertical_rate = msg.vertical_rate;
          //update = true;
        }
        if ((!isUndefinedOrNull(msg.squawk)) && (msg.squawk != plane.squawk)) {
          plane.squawk = msg.squawk;
          //update = true;
        }
        if ((!isUndefinedOrNull(msg.callsign)) && (msg.callsign != plane.callsign)) {
          plane.callsign = msg.callsign;
          //update = true;
        }

        //if (update)
        //  $rootScope.$broadcast('updateInfo', plane);

        //break;

      }
    });
    //msg = null;
  });
// Manage quality signal
  socket.on('quality', function(msg) {
    angular.forEach(planes, function(plane) {
      //var plane = planes[id];  
      if (plane.ICAO == msg.ICAO) {
        if (msg.quality != plane.quality) {
          plane.quality = msg.quality;
          if (msg.quality<30)
            plane.icon.fillColor = '#DF0101';
          else if (msg.quality<60)
            plane.icon.fillColor = '#D7DF01';
          else
            plane.icon.fillColor = '#1C1C1C';
          //$rootScope.$broadcast('qualityPlane', {ICAO : msg.ICAO, quality: plane.quality});
        }
        //break;
      }
    });
    //msg = null;
  });
  // Manage remove older plane
  socket.on('delete', function(msg) {
    angular.forEach(planes, function(plane,id) {
      //var plane = planes[id];   
      if (plane.ICAO == msg.ICAO) {
          // before delete
          //$rootScope.$broadcast('deletePlane', {ICAO : msg.ICAO});
          planes.splice(id,1);
          in_view -= 1;
          //break;    
      }
    });
    //msg = null;
  });
  // Detect client count
  socket.on('client_count', function(count) {
    client_count = count;
  }); 
  // Otherwise use custom update
  return {
    Planes : planes,
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
    getPlaneInView : function() {
      return in_view;
    },
    getClientCount : function() {
      return client_count;
    },
    getPlaneInfo : function(plane) {
      console.log(plane);
      //unselect all other plane
      angular.forEach(planes, function(plane) {
          if (plane.show) {
            plane.show = false;
            plane.icon.strokeColor = '#1C1C1C';
            plane.icon.strokeWeight = 1;
            plane.icon.scale = 0.05;
          }          
      });
      // update plane structure
      plane.show = true;
      plane.icon.strokeColor = '#00BFFF';
      plane.icon.strokeWeight = 1;
      plane.icon.scale = 0.06;

      // query plane information and return promise with only data
      return $http.get('/rest/flight/'+plane.ICAO).then(function(response) {
        return response.data;
      });
    }
  };
}]);