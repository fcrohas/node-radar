angular.module('controllers').controller('mapCtrl', ['$scope','$http', 'uiGmapGoogleMapApi','uiGmapIsReady', '$rootScope','PlaneService', 'SocketService', function($scope,$http,GoogleMapApi,IsReady,$rootScope,PlaneService, socket) { 
  var googleMaps = {};
  var phaseCount = 0;
  //$rootScope.in_view = 0;
  $scope.socket = socket;
  // clone plane object
  function clone(obj) {
      if (null == obj || "object" != typeof obj) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
  }

  // Markers list
  $scope.planesMarkers = [];
  $scope.trackhistory = [];
  $scope.trackhistory.show = false;
  // Make gradient color between two color
  function makeGradientColor(color1, color2, percent) {
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
  }
  function radians(n) {
    return n * (Math.PI / 180);
  }
  function degrees(n) {
    return n * (180 / Math.PI);
  }

  function getBearing(startLat,startLong,endLat,endLong){
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

  // When plane marker is added
  $scope.$on('addPlane', function(event,msg) {
    // add plane only if coord exist
    var plane = clone(msg);    
      plane.icon = {
        path: 'm -79.118479,-9.2641052 c -1.437381,-10.4868878 -3.628647,-7.4387398 28.329918,-39.4083068 l 28.893679,-28.903634 -0.05168,-6.562443 c -0.02846,-3.609347 -0.289505,-42.566551 -0.580197,-86.571581 -0.290684,-44.00502 -0.86167,-80.00913 -1.268843,-80.00913 -0.407183,0 -18.470116,5.37835 -40.139852,11.95189 l -39.399522,11.9519 -56.53776,31.98713 c -31.09575,17.59294 -57.09049,31.77504 -57.76606,31.5158 -1.44923,-0.55613 -1.46499,-1.27875 -0.33034,-15.1547 0.47845,-5.85109 1.31636,-11.73046 1.86202,-13.06528 0.63418,-1.55134 15.58773,-14.33018 41.44777,-35.41996 22.25061,-18.14616 48.91922,-40.39188 59.26359,-49.43493 l 18.807931,-16.44192 0.03076,-7.61793 c 0.01693,-4.18987 0.291552,-12.46782 0.610286,-18.39546 l 0.579496,-10.77752 6.052565,0 c 6.84458,0 5.92119,-1.17382 8.329283,10.58838 0.743061,3.62946 1.474819,6.72281 1.626132,6.87412 0.151312,0.15131 1.689731,-0.22515 3.41869,-0.83657 1.916363,-0.6777 12.648695,-9.57151 27.491334,-22.78189 l 24.347742,-21.67019 0.631642,-40.69695 0.631642,-40.69694 4.784183,-23.83137 4.784183,-23.83136 4.8536951,-8.21671 c 7.63187856,-12.91983 8.9959789,-12.90806 16.4639473,0.14198 4.5028256,7.86855 4.5440576,8.01211 9.3566006,32.57388 l 4.833864,24.6705 0.560782,39.53775 0.560782,39.53776 24.368442,21.63266 c 21.743025,19.302 29.425994,25.10999 31.057702,23.47827 0.384292,-0.38428 1.029259,-3.14425 2.865542,-12.26231 l 1.02659,-5.09753 6.016545,0 6.016554,0 0.56955,5.44921 c 0.313254,2.99707 0.596917,11.27502 0.630365,18.39545 l 0.06082,12.94624 17.840911,15.51424 c 9.81249,8.53283 36.21474,30.38394 58.67166,48.55802 22.45692,18.17407 41.68495,34.22587 42.72895,35.67066 1.52152,2.10559 2.01125,4.43248 2.46791,11.72587 0.31334,5.00445 0.79289,10.99219 1.06567,13.30611 0.38551,3.27013 0.1958,4.3223 -0.85184,4.72431 -0.81235,0.31172 -23.9419,-12.21053 -58.22032,-31.52028 l -56.87255,-32.03747 -39.500439,-11.91569 c -21.725241,-6.55363 -39.821907,-11.9157 -40.214816,-11.9157 -0.3929,0 -0.951927,35.60517 -1.242274,79.12261 -0.290346,43.51743 -0.585658,82.504213 -0.656243,86.637294 l -0.128343,7.514688 29.092758,28.510841 29.092757,28.510841 -0.416446,7.193916 c -0.229043,3.956662 -0.633876,7.4113459 -0.899622,7.6770914 -0.265745,0.2657456 -15.527951,-3.1257729 -33.916027,-7.5367004 -18.388076,-4.410937 -33.978093,-8.019877 -34.6444963,-8.019877 -0.6663941,0 -3.1231134,3.177351 -5.4593624,7.060786 -2.336249,3.883435 -4.44719584,7.070042 -4.69099098,7.0813541 -0.24379512,0.011259 -2.17364212,-2.9665791 -4.28854282,-6.6175221 -2.1149007,-3.650952 -4.2034007,-6.63809 -4.6411061,-6.63809 -0.4377054,0 -15.7240514,3.590438 -33.9696624,7.97875 -18.245611,4.388313 -33.556407,7.9787506 -34.023989,7.9787506 -0.467581,0 -1.103842,-1.8509016 -1.413914,-4.1131078 z',
        fillColor: '#1C1C1C',
        fillOpacity: 1.0,
        scale: 0.05,
        strokeColor: '#1C1C1C',
        rotation: plane.track,
        strokeWeight: 1
      };
      plane.show = false;
      plane.options = {
        /*labelContent : '',
        labelAnchor : '22 0',
        labelInBackground : true,
        labelClass : 'labels',
        labelVisible : false*/
      };
      // Set overlay
      if ((plane.latitude != null) && (plane.longitude != null)) {
          plane.options.visible = true;
          $rootScope.in_view += 1;
      } else {
          plane.options.visible = false;
      }


      // Add a click marker event
      plane.onClick = function(data) {
        var adsb = data.key;
        if (!data.model.show) {
          $scope.$emit('planeSelect', adsb);
        } else {
          $scope.$emit('planeUnSelect', adsb); 
        }
      };      
      $scope.planesMarkers.push(plane);
      //$scope.$emit('qualityPlane',plane);
    msg = null;
  });
/*
  $scope.$on('planeSelected' ,function(event,ICAO) {
      $scope.trackhistory.show = true;            
      $scope.trackhistory = [];       
      for(var id in $scope.planesMarkers) {
        var plane = $scope.planesMarkers[id];   
        if (plane.ICAO == ICAO) {
            plane.show = true;
            plane.icon.strokeColor = '#00BFFF';
            plane.icon.strokeWeight = 1;
            plane.icon.scale = 0.06;
            PlaneService.getTrackHistory(ICAO,function(data) {
                  $scope.trackhistory = data.trackhistory;
                  $scope.trackhistory.show = true;            
            });         
        }
      }
  });

  $scope.$on('planeUnSelected' ,function(event,ICAO) {
      $scope.trackhistory.show = false;            
      $scope.trackhistory = [];            
      for(var id in $scope.planesMarkers) {
        var plane = $scope.planesMarkers[id];   
        if (plane.ICAO == ICAO) {
          plane.show= false;
          plane.icon.strokeColor = '#1C1C1C';
          plane.icon.strokeWeight = 1;
          plane.icon.scale = 0.05;          
        }
      }
  });
*/
  $scope.$on('updatePlane', function(event,msg) {
    // update plane position 
    for(var id in $scope.planesMarkers) {
      var plane = $scope.planesMarkers[id];   
      if (plane.ICAO == msg.ICAO) {
          // before delete
          if ((msg.Engines != undefined) && (msg.ModelType != undefined)
              && (msg.Engines != plane.Engines) && (msg.ModelType != plane.ModelType))  { 
              if (msg.Engines.indexOf('4 Jet') == 0) {
                plane.icon.path = 'm -1.3526448,-503.44497 c -12.9560102,0 -19.1740302,42.80954 -21.3773502,62.88076 -0.45814,6.08867 -0.97291,11.61987 -0.97291,17.30086 l 0,60.50256 c -0.13431,3.44701 -0.73266,4.40381 -2.7242,6.13875 l -46.71457,40.69575 c -3.18764,2.20418 -7.33515,2.12237 -7.01798,-5.45346 l 0,-5.40876 c 0,-2.98059 -2.38348,-5.40877 -5.36407,-5.40877 l -6.70508,0 c -2.98058,0 -5.40876,2.42818 -5.40876,5.40877 l 0,31.72032 c 0.0157,0.9701 -0.15769,1.05125 -0.84818,1.66519 l -44.299345,39.38693 c -4.53651,3.15795 -6.19859,0.0596 -6.43688,-5.49816 l 0,-9.87881 c 0,-2.98059 -2.38347,-5.40877 -5.36406,-5.40877 l -6.70508,0 c -2.98059,0 -5.40876,2.42818 -5.40876,5.40877 l 0,32.85504 c -0.003,0.41191 -0.17177,0.45043 -0.35881,0.66367 l -47.51545,40.99372 c -3.02542,3.87152 -4.81843,5.63897 -4.69355,12.20324 l -0.16908,18.42478 c -0.38261,2.50774 1.95765,3.50595 3.60106,2.71745 0,0 81.13485,-50.09326 112.25296,-63.82789 31.118125,-13.73463 72.593655,-23.15487 72.593655,-23.15487 3.19835,-0.77396 6.05794,-0.86459 7.28618,2.54793 l 0,133.07345 0,5.54286 c 0.0822,16.544666 6.33244,26.555332 0,32.497282 l -51.72296,50.26863 c -3.14093,3.34871 -4.95346,6.21196 -5.32091,11.62338 l 0.0775,5.7259399 c 0.17422,2.67887 1.18044,4.05562 3.63446,3.73986 l 66.1568,-16.2660699 c 1.7351202,-0.54805 3.1135602,-0.36124 4.3312402,1.32162 L 0.20984518,-3.5590481 8.5123854,-18.828058 c 1.147,-1.63534 3.3026396,-2.41373 4.9264696,-1.83124 20.40655,4.83258 40.8131,9.66517 61.21964,14.4977499 2.62547,0.31568 4.75398,0.26075 5.09024,-3.26192 l 0,-8.7426799 c -1.3742,-6.03068 -4.84032,-8.84032 -8.47592,-12.46919 l -51.92915,-44.22104 c -4.85769,-4.92351 -0.0429,-15.32292 1.60922,-32.005572 l 0,-5.49817 0,-131.50893 0.0446,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 c 0.0402,-0.19235 0.0865,-0.39686 0.13403,-0.58111 0.0473,-0.18425 0.1233,-0.36115 0.1788,-0.53641 0.0555,-0.17527 0.11458,-0.32632 0.1788,-0.4917 0.0642,-0.16539 0.10499,-0.33709 0.1788,-0.49171 0.0738,-0.15461 0.13918,-0.30406 0.22351,-0.447 0.0842,-0.1429 0.17275,-0.27191 0.2682,-0.40231 0.0954,-0.13045 0.20549,-0.24064 0.3129,-0.3576 0.10743,-0.11701 0.23745,-0.25499 0.35761,-0.35761 0.12015,-0.1027 0.22391,-0.18079 0.3576,-0.2682 0.13374,-0.0874 0.29902,-0.19691 0.44701,-0.2682 0.148,-0.0712 0.28391,-0.12459 0.447,-0.1788 0.16308,-0.0544 0.35743,-0.0978 0.53641,-0.13403 0.17897,-0.0363 0.34078,-0.0718 0.5364,-0.0894 0.19564,-0.0176 0.41274,-0.003 0.62581,0 0.21308,0.001 0.43921,0.022 0.67051,0.0446 0.2313,0.0226 0.4649,0.0453 0.71521,0.0894 0,0 37.6559,8.16667 69.42033,21.59007 31.764435,13.4234 116.465785,64.12202 116.465785,64.12202 1.94021,0.39708 3.57657,0.10198 3.82331,-1.80048 l 0,-17.12931 c 0.11215,-4.595 -2.60719,-8.67873 -4.60415,-10.50463 l -46.49641,-41.13968 c -1.60175,-1.94784 -1.95895,-2.32195 -2.00365,-3.47335 l 0,-32.54006 c 0,-2.98059 -2.42818,-5.40877 -5.40877,-5.40877 l -6.70507,0 c -2.98059,0 -5.36407,2.42818 -5.36407,5.40877 l 0,9.87881 c 0.52057,5.87725 -1.04367,8.05372 -4.69355,5.27466 l -45.600265,-39.16053 c -1.02016,-0.87224 -1.25859,-0.91239 -1.24588,-1.76292 l 0,-31.62549 c 0,-2.98059 -2.42817,-5.40877 -5.40876,-5.40877 l -6.70508,0 c -2.98059,0 -5.36406,2.42818 -5.36406,5.40877 l 0,5.40876 c 0.75793,7.53296 -4.18952,9.04252 -7.50969,5.40876 l -46.40138,-40.74939 c -2.16309,-1.95235 -2.36689,-3.14928 -2.59039,-5.87517 l 0,-60.66789 c -0.1463,-5.99709 -0.46962,-12.72278 -1.12829,-18.20055 -2.70364,-21.24879 -10.9380296,-67.1006 -21.1772698,-61.98098 z';
              } else if (msg.Engines.indexOf('2 Jet') == 0) {
                plane.icon.path = 'm -79.118479,-9.2641052 c -1.437381,-10.4868878 -3.628647,-7.4387398 28.329918,-39.4083068 l 28.893679,-28.903634 -0.05168,-6.562443 c -0.02846,-3.609347 -0.289505,-42.566551 -0.580197,-86.571581 -0.290684,-44.00502 -0.86167,-80.00913 -1.268843,-80.00913 -0.407183,0 -18.470116,5.37835 -40.139852,11.95189 l -39.399522,11.9519 -56.53776,31.98713 c -31.09575,17.59294 -57.09049,31.77504 -57.76606,31.5158 -1.44923,-0.55613 -1.46499,-1.27875 -0.33034,-15.1547 0.47845,-5.85109 1.31636,-11.73046 1.86202,-13.06528 0.63418,-1.55134 15.58773,-14.33018 41.44777,-35.41996 22.25061,-18.14616 48.91922,-40.39188 59.26359,-49.43493 l 18.807931,-16.44192 0.03076,-7.61793 c 0.01693,-4.18987 0.291552,-12.46782 0.610286,-18.39546 l 0.579496,-10.77752 6.052565,0 c 6.84458,0 5.92119,-1.17382 8.329283,10.58838 0.743061,3.62946 1.474819,6.72281 1.626132,6.87412 0.151312,0.15131 1.689731,-0.22515 3.41869,-0.83657 1.916363,-0.6777 12.648695,-9.57151 27.491334,-22.78189 l 24.347742,-21.67019 0.631642,-40.69695 0.631642,-40.69694 4.784183,-23.83137 4.784183,-23.83136 4.8536951,-8.21671 c 7.63187856,-12.91983 8.9959789,-12.90806 16.4639473,0.14198 4.5028256,7.86855 4.5440576,8.01211 9.3566006,32.57388 l 4.833864,24.6705 0.560782,39.53775 0.560782,39.53776 24.368442,21.63266 c 21.743025,19.302 29.425994,25.10999 31.057702,23.47827 0.384292,-0.38428 1.029259,-3.14425 2.865542,-12.26231 l 1.02659,-5.09753 6.016545,0 6.016554,0 0.56955,5.44921 c 0.313254,2.99707 0.596917,11.27502 0.630365,18.39545 l 0.06082,12.94624 17.840911,15.51424 c 9.81249,8.53283 36.21474,30.38394 58.67166,48.55802 22.45692,18.17407 41.68495,34.22587 42.72895,35.67066 1.52152,2.10559 2.01125,4.43248 2.46791,11.72587 0.31334,5.00445 0.79289,10.99219 1.06567,13.30611 0.38551,3.27013 0.1958,4.3223 -0.85184,4.72431 -0.81235,0.31172 -23.9419,-12.21053 -58.22032,-31.52028 l -56.87255,-32.03747 -39.500439,-11.91569 c -21.725241,-6.55363 -39.821907,-11.9157 -40.214816,-11.9157 -0.3929,0 -0.951927,35.60517 -1.242274,79.12261 -0.290346,43.51743 -0.585658,82.504213 -0.656243,86.637294 l -0.128343,7.514688 29.092758,28.510841 29.092757,28.510841 -0.416446,7.193916 c -0.229043,3.956662 -0.633876,7.4113459 -0.899622,7.6770914 -0.265745,0.2657456 -15.527951,-3.1257729 -33.916027,-7.5367004 -18.388076,-4.410937 -33.978093,-8.019877 -34.6444963,-8.019877 -0.6663941,0 -3.1231134,3.177351 -5.4593624,7.060786 -2.336249,3.883435 -4.44719584,7.070042 -4.69099098,7.0813541 -0.24379512,0.011259 -2.17364212,-2.9665791 -4.28854282,-6.6175221 -2.1149007,-3.650952 -4.2034007,-6.63809 -4.6411061,-6.63809 -0.4377054,0 -15.7240514,3.590438 -33.9696624,7.97875 -18.245611,4.388313 -33.556407,7.9787506 -34.023989,7.9787506 -0.467581,0 -1.103842,-1.8509016 -1.413914,-4.1131078 z';
              } else if (msg.Engines.indexOf('1 Piston') == 0) {
                plane.icon.path = 'm -46.997928,2.6628295 c -11.06954,-0.5196148 -16.16607,-1.5157581 -17.79467,-3.4780904 -3.54037,-4.2658971 -3.3996,-45.0049391 0.16381,-47.4086141 1.70694,-1.151379 11.70524,-1.383113 27.40661,-0.635222 l 24.71931,1.177464 -0.99441,-4.236803 c -0.54693,-2.330258 -5.43233,-25.89496 -10.85644,-52.366004 -5.42412,-26.47107 -10.30304,-48.84277 -10.84206,-49.71491 -0.53901,-0.87214 -27.41168,-1.58571 -59.71705,-1.58571 -54.895622,0 -58.933392,-0.21698 -61.739472,-3.31767 -4.00159,-4.4217 -6.53403,-58.02148 -3.04902,-64.53329 4.82914,-9.02332 10.62182,-9.71815 69.203272,-8.30094 l 53.86126,1.30303 5.07063,-24.83117 c 2.78884,-13.65713 5.96335,-25.78089 7.05445,-26.94167 1.09111,-1.16078 6.86665,-3.10381 12.83455,-4.31784 8.9154904,-1.81366 12.7357104,-1.75677 21.41982,0.31898 l 10.56911,2.52632 5.28275,25.44303 5.28277,25.44303 61.33013,0.53412 61.330138,0.53413 3.86084,4.47882 c 3.67229,4.26009 3.82887,5.87865 3.20638,33.14327 -0.38639,16.92411 -1.49882,30.22969 -2.71604,32.48604 -2.02296,3.75002 -3.24629,3.84628 -65.309898,5.13922 l -63.24832,1.31762 -10.39911,48.60662 c -5.71951,26.733645 -10.8239996,50.420548 -11.3433096,52.637564 l -0.9442,4.030938 27.1114696,0 27.11148,0 1.93568,4.926702 c 1.93102,4.914824 1.09301,36.113352 -1.12528,41.894148 -0.78229,2.0386151 -4.53507,3.1653428 -13.23638,3.9740386 -16.61567,1.5442613 -76.46513,2.6434712 -95.4388,1.7528489 z';
              } else if ((msg.ModelType.indexOf('Falcon') == 0) || (msg.ModelType.indexOf('C510') == 0) || (msg.Engines.indexOf('2 Turbo') == 0)) {
                plane.icon.path = 'm -3.3472928,-8.1193775 c -3.6003136,-6.6048535 -4.4868503,-7.6617015 -6.0982032,-7.2696525 -1.036998,0.252297 -16.2472,3.272086 -33.800451,6.7106258 -17.55325,3.4385399 -32.621129,6.419268 -33.484173,6.6238255 -2.227188,0.5278918 -4.014348,-3.5129551 -3.49104,-7.8933777 0.408149,-3.4164916 1.24871,-4.2266096 22.995964,-22.1631956 12.414776,-10.239396 22.77208,-19.10556 23.016212,-19.702593 0.244141,-0.597032 -0.572502,-3.788532 -1.814766,-7.092222 -3.083096,-8.199239 -6.35832,-38.870619 -4.393668,-41.145163 0.876271,-1.01449 3.507317,-1.6382 8.754241,-2.07527 5.976199,-0.49782 7.679272,-0.95714 8.376039,-2.25906 0.544638,-1.01768 0.874595,-19.99469 0.874595,-50.30171 l 0,-48.6675 -2.062365,-1.10375 c -1.802178,-0.96449 -7.193243,0.30304 -42.730712,10.0467 l -40.66834,11.15042 -54.01808,25.31448 c -29.70995,13.92295 -54.50805,25.12645 -55.1069,24.89665 -0.81077,-0.31112 -0.98384,-3.21032 -0.67775,-11.35308 l 0.41106,-10.93527 3.35245,-3.43093 c 1.84385,-1.88701 45.18712,-33.23939 96.31838,-69.67195 62.864196,-44.79263 93.350025,-67.02472 94.152147,-68.66137 0.868646,-1.77238 1.419154,-11.00726 2.056319,-34.49507 l 0.870109,-32.07471 4.039367,-19.94688 c 4.003249,-19.76852 4.075217,-19.99594 8.0493442,-25.43489 6.9619826,-9.52809 11.9406253,-9.52926 18.7587068,-0.004 3.822415,5.33991 4.037895,6.00932 7.760797,24.1095 l 3.829233,18.61708 0.951652,32.35826 c 0.575109,19.5545 1.362922,33.65697 1.991009,35.6404 0.96089,3.03439 8.098839,8.30928 94.568026,69.88515 51.44077,36.63167 94.6532,67.70323 96.02761,69.04792 3.17205,3.10345 4.10242,7.18667 4.12888,18.12081 0.0209,8.62846 -0.004,8.73323 -1.97354,8.22798 -1.09708,-0.28149 -25.90612,-11.72277 -55.13121,-25.42509 L 109.34712,-183.39 68.68701,-194.48028 c -38.805361,-10.58439 -40.759091,-11.02542 -42.830109,-9.66844 l -2.169998,1.42184 0,47.81035 c 0,33.30712 0.300214,48.46925 0.989666,49.98243 0.905464,1.98728 1.656947,2.2249 8.832699,2.79284 4.891692,0.38716 8.222332,1.07779 8.851022,1.83531 1.709013,2.05923 -1.400882,31.076056 -4.315874,40.269172 -1.314162,4.144518 -2.389388,7.756897 -2.389388,8.02751 0,0.270612 9.773969,8.59197 21.719932,18.491915 11.945962,9.899936 22.418072,18.798547 23.271355,19.774694 2.806658,3.210782 1.253452,12.77013178 -1.921159,11.8239229 C 73.528401,-3.4676597 9.0151956,-15.587523 8.8240691,-15.05081 c -0.131277,0.368618 -1.9756627,3.817876 -4.0986486,7.6650165 l -3.85996864,6.99481079 -4.21274466,-7.72839479 0,0 z';
              }
              plane.ModelType = msg.ModelType;
              plane.Engines = msg.Engines;

          }
          if ((plane.icon.rotation != msg.track) && (msg.track!=0)) {
            plane.icon.rotation = msg.track;
          }
          if ((plane.latitude != msg.latitude) || (plane.longitude != msg.longitude)) {
            if (plane.show) {
              var color = {};
              if (msg.altitude < 3000) {
                  color = makeGradientColor({r:0,g:255,b:0}, {r:1,g:169,b:219}, (msg.altitude * 100 / 3000));
              } else if (msg.altitude < 6000) {
                  color = makeGradientColor({r:1,g:169,b:219}, {r:169,g:1,b:219}, ((msg.altitude-3000) * 100 / 3000));
              } else {
                color = makeGradientColor({r:169,g:1,b:219}, {r:223,g:1,b:86}, ((msg.altitude-6000) * 100 / 6000));
              }
              var lineColor = { 'color':color.cssColor, 'opacity':1.0,'weight':3 };
              // Get previous value
                  var bearing = Math.abs(getBearing(plane.latitude, plane.longitude, msg.latitude, msg.longitude) - plane.icon.rotation);
                  var delta_altitude = Math.abs(plane.altitude - msg.altitude);
                  // Reduce point using bearing and altitude
                  if ((bearing > 5) || (delta_altitude > 250) || ($scope.trackhistory.length == 0)) {
                    $scope.trackhistory.push( { id : $scope.trackhistory.length, 
                                                track : [{ 'latitude':plane.latitude,'longitude':plane.longitude},
                                                         {'latitude':msg.latitude,'longitude':msg.longitude}], 
                                                color : lineColor }); 
                  } else {
                    // Modify last coord point with current
                    $scope.trackhistory[$scope.trackhistory.length -1].track[1].longitude = msg.longitude;
                    $scope.trackhistory[$scope.trackhistory.length -1].track[1].latitude = msg.latitude;
                  }

            }
            if (!plane.options.visible) {
              plane.options.visible = true;
              $rootScope.in_view +=1;
            }
            if ((plane.icon.rotation == 0) || (msg.track == 0)) {
                plane.icon.rotation = getBearing(plane.latitude, plane.longitude, msg.latitude, msg.longitude);
            }
            plane.latitude = msg.latitude;
            plane.longitude = msg.longitude;
          }
          if(!$scope.$$phase) {
            if (phaseCount > 5) {
              $scope.$apply();     
              phaseCount = 0;
            }
            else phaseCount += 1;
          }     
          break;    
      }
    }
    msg = null;     
  });
  /*
  $scope.$on('qualityPlane', function(event,msg) {
    // hide plane
    for(var id in $scope.planesMarkers) {
      var plane = $scope.planesMarkers[id];   
      if (plane.ICAO == msg.ICAO) {
          // before delete
          if (msg.quality<30)
            plane.icon.fillColor = '#DF0101';
          else if (msg.quality<60)
            plane.icon.fillColor = '#D7DF01';
          else
            plane.icon.fillColor = '#1C1C1C';
          break;    
      }
    }
    msg = null;
  });      

  $scope.$on('deletePlane', function(event,msg) {
    // hide plane
    for(var id in $scope.planesMarkers) {
      var plane = $scope.planesMarkers[id];   
      if (plane.ICAO == msg.ICAO) {
          // before delete
          if (plane.show)
            $scope.trackhistory = [];          
          if (plane.options.visible)
            $rootScope.in_view -= 1;
          plane.show = false;      
          plane = null;                
          $scope.planesMarkers.splice(id,1)
          break;    
      }
    }
    msg = null;      
  });*/
}]);