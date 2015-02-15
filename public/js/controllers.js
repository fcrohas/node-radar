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

mapControllers.controller('mapCtrl', ['$scope','$http', '$timeout','$location','$rootScope','uiGmapGoogleMapApi','uiGmapIsReady', function($scope,$timeout,$http,$location,$rootScope,GoogleMapApi,IsReady) { 
  $rootScope.connected = false;
  $rootScope.planes = [];

  $scope.plane = {
    path: 'm 385.17348,19.60644 c -12.95601,0 -19.17403,42.809538 -21.37735,62.880758 -0.45814,6.088671 -0.97291,11.619864 -0.97291,17.300853 l 0,60.502569 c -0.13431,3.44701 -0.73266,4.40381 -2.7242,6.13875 l -46.71457,40.69575 c -3.18764,2.20418 -7.33515,2.12237 -7.01798,-5.45346 l 0,-5.40876 c 0,-2.98059 -2.38348,-5.40877 -5.36407,-5.40877 l -6.70508,0 c -2.98058,0 -5.40876,2.42818 -5.40876,5.40877 l 0,31.72032 c 0.0157,0.9701 -0.15769,1.05125 -0.84818,1.66519 l -44.29934,39.38693 c -4.53651,3.15795 -6.19859,0.0596 -6.43688,-5.49816 l 0,-9.87881 c 0,-2.98059 -2.38347,-5.40877 -5.36406,-5.40877 l -6.70508,0 c -2.98059,0 -5.40876,2.42818 -5.40876,5.40877 l 0,32.85504 c -0.003,0.41191 -0.17177,0.45043 -0.35881,0.66367 L 171.952,328.1708 c -3.02542,3.87152 -4.81843,5.63897 -4.69355,12.20324 l -0.16908,18.42478 c -0.38261,2.50774 1.95765,3.50595 3.60106,2.71745 0,0 81.13485,-50.09326 112.25296,-63.82789 31.11812,-13.73463 72.59365,-23.15487 72.59365,-23.15487 3.19835,-0.77396 6.05794,-0.86459 7.28618,2.54793 l 0,133.07345 0,5.54286 c 0.0822,16.54466 6.33244,26.55533 0,32.49728 l -51.72296,50.26863 c -3.14093,3.34871 -4.95346,6.21196 -5.32091,11.62338 l 0.0775,5.72594 c 0.17422,2.67887 1.18044,4.05562 3.63446,3.73986 l 66.1568,-16.26607 c 1.73512,-0.54805 3.11356,-0.36124 4.33124,1.32162 l 6.75662,14.88397 8.30254,-15.26901 c 1.147,-1.63534 3.30264,-2.41373 4.92647,-1.83124 20.40655,4.83258 40.8131,9.66517 61.21964,14.49775 2.62547,0.31568 4.75398,0.26075 5.09024,-3.26192 l 0,-8.74268 c -1.3742,-6.03068 -4.84032,-8.84032 -8.47592,-12.46919 l -51.92915,-44.22104 c -4.85769,-4.92351 -0.0429,-15.32292 1.60922,-32.00557 l 0,-5.49817 0,-131.50893 0.0446,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 0,-0.0446 0.0446,0 c 0.0402,-0.19235 0.0865,-0.39686 0.13403,-0.58111 0.0473,-0.18425 0.1233,-0.36115 0.1788,-0.53641 0.0555,-0.17527 0.11458,-0.32632 0.1788,-0.4917 0.0642,-0.16539 0.10499,-0.33709 0.1788,-0.49171 0.0738,-0.15461 0.13918,-0.30406 0.22351,-0.447 0.0842,-0.1429 0.17275,-0.27191 0.2682,-0.40231 0.0954,-0.13045 0.20549,-0.24064 0.3129,-0.3576 0.10743,-0.11701 0.23745,-0.25499 0.35761,-0.35761 0.12015,-0.1027 0.22391,-0.18079 0.3576,-0.2682 0.13374,-0.0874 0.29902,-0.19691 0.44701,-0.2682 0.148,-0.0712 0.28391,-0.12459 0.447,-0.1788 0.16308,-0.0544 0.35743,-0.0978 0.53641,-0.13403 0.17897,-0.0363 0.34078,-0.0718 0.5364,-0.0894 0.19564,-0.0176 0.41274,-0.003 0.62581,0 0.21308,10e-4 0.43921,0.022 0.67051,0.0446 0.2313,0.0226 0.4649,0.0453 0.71521,0.0894 0,0 37.6559,8.16667 69.42033,21.59007 31.76444,13.4234 116.46579,64.12202 116.46579,64.12202 1.94021,0.39708 3.57657,0.10198 3.82331,-1.80048 l 0,-17.12931 c 0.11215,-4.595 -2.60719,-8.67873 -4.60415,-10.50463 l -46.49641,-41.13968 c -1.60175,-1.94784 -1.95895,-2.32195 -2.00365,-3.47335 l 0,-32.54006 c 0,-2.98059 -2.42818,-5.40877 -5.40877,-5.40877 l -6.70507,0 c -2.98059,0 -5.36407,2.42818 -5.36407,5.40877 l 0,9.87881 c 0.52057,5.87725 -1.04367,8.05372 -4.69355,5.27466 L 482.7041,229.6514 c -1.02016,-0.87224 -1.25859,-0.91239 -1.24588,-1.76292 l 0,-31.62549 c 0,-2.98059 -2.42817,-5.40877 -5.40876,-5.40877 l -6.70508,0 c -2.98059,0 -5.36406,2.42818 -5.36406,5.40877 l 0,5.40876 c 0.75793,7.53296 -4.18952,9.04252 -7.50969,5.40876 l -46.40138,-40.74939 c -2.16309,-1.95235 -2.36689,-3.14928 -2.59039,-5.87517 l 0,-60.667899 C 407.33256,93.790966 407.00924,87.065277 406.35057,81.587509 403.64693,60.338714 395.41254,14.48691 385.1733,19.60653 z',
    fillColor: '#42FF38',
    fillOpacity: 0.7,
    scale: 0.05,
    strokeColor: '#14C90B',
    rotation: 0,
    strokeWeight: 1
  };
    
  GoogleMapApi.then(function(maps) {
      $scope.googleVersion = maps.version;
      maps.visualRefresh = true;
  });
  
  angular.extend($scope, {
    map : {
      show : true,
      control: {},
      version: "uNknown",
      center: {
        latitude: 43.6,
        longitude: -4.3
      },
      options: {
          draggable:true,
          disableDefaultUI: true,
          panControl: false,
          navigationControl: true,
          scrollwheel: true,
          scaleControl: true
      },
      zoom: 7,
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

  // Connect only once
  if ($rootScope.connected == false) {
    io.connect($location.protocol()+'://'+$location.host()+':'+$location.port()+'/socket/flight').on('connect', function(socket){
        console.log('Connected to websocket');
        $rootScope.connected = true;
        this.on('Disconnected from websocket', function(){
          console.log('user disconnected');
          $rootScope.connected = false;
        });
        this.on('message', function(msg) {
          var found = false;
          //console.log(msg);
          for(var id in $rootScope.planes) {
            if ($rootScope.planes[id].ICAO == msg.ICAO) {
              if ( msg.out_of_bound == true) {
                $rootScope.planes.remove(id);
              } else {
                $rootScope.planes[id].latitude = msg.latitude;
                $rootScope.planes[id].longitude = msg.longitude;
                $rootScope.planes[id].altitude = msg.altitude;
                $rootScope.planes[id].ground_speed = msg.ground_speed;
                $rootScope.planes[id].vertical_rate = msg.vertical_rate;
                $rootScope.planes[id].squawk = msg.squawk;
                $rootScope.planes[id].callsign = msg.callsign;
                $rootScope.planes[id].icon.rotation = msg.track;
                $rootScope.planes[id].title = msg.ICAO;
                $rootScope.planes[id].track = msg.track;
                if (msg.quality)
                  $rootScope.planes[id].icon.fillColor = '#42FF38';
                else
                  $rootScope.planes[id].icon.fillColor = '#E2FF38';
              }
              $scope.$apply();
              found = true;
            }
          }
          if (!found) {
            var plane = $scope.plane;
            plane.rotation = msg.track;
            msg.icon = plane;
            msg.show = false;
            msg.onClick = function() {
              msg.show = ! msg.show;
            };
            $scope.$apply();
            $rootScope.planes.push( msg );
          }
        });
    });
  }

  var origCenter = {latitude: $scope.map.center.latitude, longitude: $scope.map.center.longitude};

}]);

