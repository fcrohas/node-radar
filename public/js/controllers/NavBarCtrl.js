angular.module('controllers').controller('navbarCtrl', function ($scope) {
  $scope.menuList = [
    {'dropmenu': 'Radar',
     'subaction': [{'name' : 'Flight list','link' : '#/flight'},
                   {'name' : 'Flight detail','link' : '#/flight/detail'},
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