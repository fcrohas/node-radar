angular.module('controllers').controller('navbarCtrl', ['$scope','$modal', function ($scope,$modal) {
  $scope.menuList = [
    {'dropmenu': 'Radar',
     'subaction': [{'name':'Settings','click':'openSettings()'}
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

  $scope.openSettings = function() {
    $modal.open({
      animation: true,
      templateUrl: '/partial/settings',
      controller: 'SettingsCtrl',
      size: 'lg'
    });
  };
}]);