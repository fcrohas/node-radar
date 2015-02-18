var mainControllers = angular.module('mainCtrl', []);

mainControllers.controller('mainCtrl', ['$scope','$location', function ($scope,$location) {
  $scope.connected = false;
  $scope.planes = [];
  // Register general selected action
  $scope.$on('planeSelected', function(event, ICAO) { 
    // look for plane id to select
    var selectId = -1;
    for (var id in $scope.planes) {
      // use also loop to unselect current plane
      var plane = $scope.planes[id];
      if (plane.ICAO == ICAO) {
        selectId = id;
      }
      // unselect others
      plane.show = false;
    }
    // Now select current plane
    if (selectId >= 0) {
      $scope.planes[selectId].show = true;
    }
  });  
  // Connect only once
  if ($scope.connected == false) {
    io.connect($location.protocol()+'://'+$location.host()+':'+$location.port()+'/socket/flight').on('connect', function(socket){
        //console.log('Connected to websocket');
        // use a delete flag to avoid override
        $scope.connected = true;
        this.on('disconnect', function(){
          //console.log('user disconnected');
          $scope.connected = false;
        });
        this.on('client_count', function(count) {
          $scope.client_count = count;
        });
        this.on('add', function(msg) {
          msg.icon = {
            path: 'm -1.3526448,-503.44497 c -12.9560102,0 -19.1740302,42.80954 -21.3773502,62.88076 -0.45814,6.08867 -0.97291,11.61987 -0.97291,17.30086 l 0,60.50256 c -0.13431,3.44701 -0.73266,4.40381 -2.7242,6.13875 l -46.71457,40.69575 c -3.18764,2.20418 -7.33515,2.12237 -7.01798,-5.45346 l 0,-5.40876 c 0,-2.98059 -2.38348,-5.40877 -5.36407,-5.40877 l -6.70508,0 c -2.98058,0 -5.40876,2.42818 -5.40876,5.40877 l 0,31.72032 c 0.0157,0.9701 -0.15769,1.05125 -0.84818,1.66519 l -44.299345,39.38693 c -4.53651,3.15795 -6.19859,0.0596 -6.43688,-5.49816 l 0,-9.87881 c 0,-2.98059 -2.38347,-5.40877 -5.36406,-5.40877 l -6.70508,0 c -2.98059,0 -5.40876,2.42818 -5.40876,5.40877 l 0,32.85504 c -0.003,0.41191 -0.17177,0.45043 -0.35881,0.66367 l -47.51545,40.99372 c -3.02542,3.87152 -4.81843,5.63897 -4.69355,12.20324 l -0.16908,18.42478 c -0.38261,2.50774 1.95765,3.50595 3.60106,2.71745 0,0 81.13485,-50.09326 112.25296,-63.82789 31.118125,-13.73463 72.593655,-23.15487 72.593655,-23.15487 3.19835,-0.77396 6.05794,-0.86459 7.28618,2.54793 l 0,133.07345 0,5.54286 c 0.0822,16.544666 6.33244,26.555332 0,32.497282 l -51.72296,50.26863 c -3.14093,3.34871 -4.95346,6.21196 -5.32091,11.62338 l 0.0775,5.7259399 c 0.17422,2.67887 1.18044,4.05562 3.63446,3.73986 l 66.1568,-16.2660699 c 1.7351202,-0.54805 3.1135602,-0.36124 4.3312402,1.32162 L 0.20984518,-3.5590481 8.5123854,-18.828058 c 1.147,-1.63534 3.3026396,-2.41373 4.9264696,-1.83124 20.40655,4.83258 40.8131,9.66517 61.21964,14.4977499 2.62547,0.31568 4.75398,0.26075 5.09024,-3.26192 l 0,-8.7426799 c -1.3742,-6.03068 -4.84032,-8.84032 -8.47592,-12.46919 l -51.92915,-44.22104 c -4.85769,-4.92351 -0.0429,-15.32292 1.60922,-32.005572 l 0,-5.49817 0,-131.50893 0.0446,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 c 0.0402,-0.19235 0.0865,-0.39686 0.13403,-0.58111 0.0473,-0.18425 0.1233,-0.36115 0.1788,-0.53641 0.0555,-0.17527 0.11458,-0.32632 0.1788,-0.4917 0.0642,-0.16539 0.10499,-0.33709 0.1788,-0.49171 0.0738,-0.15461 0.13918,-0.30406 0.22351,-0.447 0.0842,-0.1429 0.17275,-0.27191 0.2682,-0.40231 0.0954,-0.13045 0.20549,-0.24064 0.3129,-0.3576 0.10743,-0.11701 0.23745,-0.25499 0.35761,-0.35761 0.12015,-0.1027 0.22391,-0.18079 0.3576,-0.2682 0.13374,-0.0874 0.29902,-0.19691 0.44701,-0.2682 0.148,-0.0712 0.28391,-0.12459 0.447,-0.1788 0.16308,-0.0544 0.35743,-0.0978 0.53641,-0.13403 0.17897,-0.0363 0.34078,-0.0718 0.5364,-0.0894 0.19564,-0.0176 0.41274,-0.003 0.62581,0 0.21308,0.001 0.43921,0.022 0.67051,0.0446 0.2313,0.0226 0.4649,0.0453 0.71521,0.0894 0,0 37.6559,8.16667 69.42033,21.59007 31.764435,13.4234 116.465785,64.12202 116.465785,64.12202 1.94021,0.39708 3.57657,0.10198 3.82331,-1.80048 l 0,-17.12931 c 0.11215,-4.595 -2.60719,-8.67873 -4.60415,-10.50463 l -46.49641,-41.13968 c -1.60175,-1.94784 -1.95895,-2.32195 -2.00365,-3.47335 l 0,-32.54006 c 0,-2.98059 -2.42818,-5.40877 -5.40877,-5.40877 l -6.70507,0 c -2.98059,0 -5.36407,2.42818 -5.36407,5.40877 l 0,9.87881 c 0.52057,5.87725 -1.04367,8.05372 -4.69355,5.27466 l -45.600265,-39.16053 c -1.02016,-0.87224 -1.25859,-0.91239 -1.24588,-1.76292 l 0,-31.62549 c 0,-2.98059 -2.42817,-5.40877 -5.40876,-5.40877 l -6.70508,0 c -2.98059,0 -5.36406,2.42818 -5.36406,5.40877 l 0,5.40876 c 0.75793,7.53296 -4.18952,9.04252 -7.50969,5.40876 l -46.40138,-40.74939 c -2.16309,-1.95235 -2.36689,-3.14928 -2.59039,-5.87517 l 0,-60.66789 c -0.1463,-5.99709 -0.46962,-12.72278 -1.12829,-18.20055 -2.70364,-21.24879 -10.9380296,-67.1006 -21.1772698,-61.98098 z',
            fillColor: '#1C1C1C',
            fillOpacity: 1.0,
            scale: 0.05,
            strokeColor: '#1C1C1C',
            rotation: msg.track,
            strokeWeight: 1
          };
          msg.lineColor = { 'color':'#00FF00', 'opacity':1.0,'weight':3 };
          msg.trackhistory = [];
          msg.show = false;
          msg.onClick = function() {
            msg.show = ! msg.show;
          };
          $scope.planes.push( msg );
          //console.log('add ICAO='+msg.ICAO+' length='+$scope.planes.length+ 'bound='+msg.out_of_bound);            
        });        
        this.on('quality', function(msg) {
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];                
            if (plane.ICAO == msg.ICAO) {
              if (msg.quality != plane.quality) {
                if (msg.quality<30)
                  plane.icon.fillColor = '#DF0101';
                else if (msg.quality<60)
                  plane.icon.fillColor = '#D7DF01';
                else
                  plane.icon.fillColor = '#1C1C1C';
                plane.quality = msg.quality;
              }
            }
          }
        });
        this.on('delete', function(msg) {
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];                
            if (plane.ICAO == msg.ICAO) {
                // before delete
                plane.trackhistory = [];
                $scope.planes.splice(id,1);
                //console.log('remove ICAO='+msg.ICAO+' length='+$scope.planes.length); 
                break;    
            }
          }
        });
        this.on('change', function(msg) {
          var found = false
          for(var id in $scope.planes) {
            var plane = $scope.planes[id];                
            if (plane.ICAO == msg.ICAO) {
              // not of bound as we receive a signal
              if ((msg.latitude != null) && ((msg.latitude != plane.latitude) || (msg.longitude!=plane.longitude)))  {
                // polyline color from altitude
                var color = (plane.altitude < 3000) ? '#00FF00' : (plane.altitude < 6000) ? '#01A9DB' : '#A901DB';
                plane.trackhistory.push( { 'latitude':msg.latitude,'longitude':msg.longitude});
                plane.lineColor = { 'color':color, 'opacity':1.0,'weight':2 };
                plane.latitude = msg.latitude;
                plane.longitude = msg.longitude;
              }
              if (msg.altitude != plane.altitude)
                plane.altitude = msg.altitude;
              if (msg.ground_speed != plane.ground_speed)
                plane.ground_speed = msg.ground_speed;
              if (msg.vertical_rate != plane.vertical_rate)
                plane.vertical_rate = msg.vertical_rate;
              if (msg.squawk != plane.squawk)
                plane.squawk = msg.squawk;
              if (msg.callsign != plane.callsign)
                plane.callsign = msg.callsign;
              // Update Icon
              if (msg.track != plane.icon.rotation) {
                plane.track = msg.track;
                plane.icon.rotation = msg.track;
              }
              //console.log('update ICAO='+msg.ICAO+'length='+$scope.planes.length);                 
              found = true;
              break;
            }
          }
          if (!found) {
            msg.icon = {
              path: 'm -1.3526448,-503.44497 c -12.9560102,0 -19.1740302,42.80954 -21.3773502,62.88076 -0.45814,6.08867 -0.97291,11.61987 -0.97291,17.30086 l 0,60.50256 c -0.13431,3.44701 -0.73266,4.40381 -2.7242,6.13875 l -46.71457,40.69575 c -3.18764,2.20418 -7.33515,2.12237 -7.01798,-5.45346 l 0,-5.40876 c 0,-2.98059 -2.38348,-5.40877 -5.36407,-5.40877 l -6.70508,0 c -2.98058,0 -5.40876,2.42818 -5.40876,5.40877 l 0,31.72032 c 0.0157,0.9701 -0.15769,1.05125 -0.84818,1.66519 l -44.299345,39.38693 c -4.53651,3.15795 -6.19859,0.0596 -6.43688,-5.49816 l 0,-9.87881 c 0,-2.98059 -2.38347,-5.40877 -5.36406,-5.40877 l -6.70508,0 c -2.98059,0 -5.40876,2.42818 -5.40876,5.40877 l 0,32.85504 c -0.003,0.41191 -0.17177,0.45043 -0.35881,0.66367 l -47.51545,40.99372 c -3.02542,3.87152 -4.81843,5.63897 -4.69355,12.20324 l -0.16908,18.42478 c -0.38261,2.50774 1.95765,3.50595 3.60106,2.71745 0,0 81.13485,-50.09326 112.25296,-63.82789 31.118125,-13.73463 72.593655,-23.15487 72.593655,-23.15487 3.19835,-0.77396 6.05794,-0.86459 7.28618,2.54793 l 0,133.07345 0,5.54286 c 0.0822,16.544666 6.33244,26.555332 0,32.497282 l -51.72296,50.26863 c -3.14093,3.34871 -4.95346,6.21196 -5.32091,11.62338 l 0.0775,5.7259399 c 0.17422,2.67887 1.18044,4.05562 3.63446,3.73986 l 66.1568,-16.2660699 c 1.7351202,-0.54805 3.1135602,-0.36124 4.3312402,1.32162 L 0.20984518,-3.5590481 8.5123854,-18.828058 c 1.147,-1.63534 3.3026396,-2.41373 4.9264696,-1.83124 20.40655,4.83258 40.8131,9.66517 61.21964,14.4977499 2.62547,0.31568 4.75398,0.26075 5.09024,-3.26192 l 0,-8.7426799 c -1.3742,-6.03068 -4.84032,-8.84032 -8.47592,-12.46919 l -51.92915,-44.22104 c -4.85769,-4.92351 -0.0429,-15.32292 1.60922,-32.005572 l 0,-5.49817 0,-131.50893 0.0446,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 c 0.0402,-0.19235 0.0865,-0.39686 0.13403,-0.58111 0.0473,-0.18425 0.1233,-0.36115 0.1788,-0.53641 0.0555,-0.17527 0.11458,-0.32632 0.1788,-0.4917 0.0642,-0.16539 0.10499,-0.33709 0.1788,-0.49171 0.0738,-0.15461 0.13918,-0.30406 0.22351,-0.447 0.0842,-0.1429 0.17275,-0.27191 0.2682,-0.40231 0.0954,-0.13045 0.20549,-0.24064 0.3129,-0.3576 0.10743,-0.11701 0.23745,-0.25499 0.35761,-0.35761 0.12015,-0.1027 0.22391,-0.18079 0.3576,-0.2682 0.13374,-0.0874 0.29902,-0.19691 0.44701,-0.2682 0.148,-0.0712 0.28391,-0.12459 0.447,-0.1788 0.16308,-0.0544 0.35743,-0.0978 0.53641,-0.13403 0.17897,-0.0363 0.34078,-0.0718 0.5364,-0.0894 0.19564,-0.0176 0.41274,-0.003 0.62581,0 0.21308,0.001 0.43921,0.022 0.67051,0.0446 0.2313,0.0226 0.4649,0.0453 0.71521,0.0894 0,0 37.6559,8.16667 69.42033,21.59007 31.764435,13.4234 116.465785,64.12202 116.465785,64.12202 1.94021,0.39708 3.57657,0.10198 3.82331,-1.80048 l 0,-17.12931 c 0.11215,-4.595 -2.60719,-8.67873 -4.60415,-10.50463 l -46.49641,-41.13968 c -1.60175,-1.94784 -1.95895,-2.32195 -2.00365,-3.47335 l 0,-32.54006 c 0,-2.98059 -2.42818,-5.40877 -5.40877,-5.40877 l -6.70507,0 c -2.98059,0 -5.36407,2.42818 -5.36407,5.40877 l 0,9.87881 c 0.52057,5.87725 -1.04367,8.05372 -4.69355,5.27466 l -45.600265,-39.16053 c -1.02016,-0.87224 -1.25859,-0.91239 -1.24588,-1.76292 l 0,-31.62549 c 0,-2.98059 -2.42817,-5.40877 -5.40876,-5.40877 l -6.70508,0 c -2.98059,0 -5.36406,2.42818 -5.36406,5.40877 l 0,5.40876 c 0.75793,7.53296 -4.18952,9.04252 -7.50969,5.40876 l -46.40138,-40.74939 c -2.16309,-1.95235 -2.36689,-3.14928 -2.59039,-5.87517 l 0,-60.66789 c -0.1463,-5.99709 -0.46962,-12.72278 -1.12829,-18.20055 -2.70364,-21.24879 -10.9380296,-67.1006 -21.1772698,-61.98098 z',
              fillColor: '#1C1C1C',
              fillOpacity: 1.0,
              scale: 0.05,
              strokeColor: '#1C1C1C',
              rotation: msg.track,
              strokeWeight: 1
            };
            msg.lineColor = { 'color':'#00FF00', 'opacity':1.0,'weight':3 };
            msg.trackhistory = [];
            msg.show = false;
            msg.showWindow = false;
            msg.onClick = function() {
              msg.showWindow = true;
            };
            $scope.planes.push( msg );
            //console.log('change add ICAO='+msg.ICAO+' length='+$scope.planes.length+ 'bound='+msg.out_of_bound);            
          }
        });
    });
  }
}]);


var sidebarControllers = angular.module('sidebarCtrl', []);

sidebarControllers.controller('sidebarCtrl', function ($scope) {
  $scope.show = true;
  $scope.toggleClass = '';
  $scope.toggle = function() {
    $scope.show = !$scope.show;
    $scope.toggleClass = $scope.show ? '' : 'toggled'; 
  }
});

var mainControllers = angular.module('navbarCtrl', []);

mainControllers.controller('navbarCtrl', function ($scope) {
  $scope.menuList = [
    {'dropmenu': 'Radar',
     'subaction': [{'name' : 'Flight detail','link' : '#/flight/detail'},
                   {'name':'Flight history','link':'#/flight/history'}, 
                   {'name':'Settings','link':'#/settings'}
                  ]},
    {'dropmenu': 'Help',
     'subaction': [{'name':'How to use it','link':'#/help/howto'},
                   {'name':'Statistics','link':'#/help/statistics'}]},
    {'dropmenu': 'About',
     'subaction': [{'name':'Node radar','link':'#/about/noderadar'},
                   {'name':'NodeJs','link':'#/about/nodejs'},
                   {'name':'ADS-B','link':'#/about/adsb'}
                  ]}
  ];
});

var menuControllers = angular.module('menuCtrl', []);

menuControllers.controller('FlightCtrl', ['$scope', '$http',
    function ($scope, $http) {

        $scope.Selected = function() {
            //console.log('Selected plane ICAO '+this.plane.ICAO)
            $http.get('/rest/flight/'+this.plane.ICAO).success(function(data) {
              $scope.planeinfo = data;
            });
            $scope.$emit('planeSelected', this.plane.ICAO);
        };        
    }

  ]);

menuControllers.controller('HistoryCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);

menuControllers.controller('SettingsCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);

menuControllers.controller('HelpCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);

menuControllers.controller('AboutCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    }
  ]);

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

