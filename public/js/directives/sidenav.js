angular.module('directives').directive('sidenav', function factory($window) {
        return {
            restrict: 'EA',
            template: '<div ng-class="{\'sidenav\':!pinned,\'sidenav-pinned\':pinned}"><div class="sidenav-content">'
            +'<a class="btn pull-right" ng-click="pinNav()">'
            +'<span class="glyphicon glyphicon-pushpin"></span>'
            +'</a><ng-transclude></ng-transclude></div>'
            +'<div class="menu-flight"><a class="btn" ng-click="planeNav()">'
            +'<span class="glyphicon glyphicon-plane"></span></div>'
            +'<div class="menu-settings"><a class="btn" ng-click="planeSettings()">'
            +'<span class="glyphicon glyphicon-cog"></span></div>'
            +'<div class="menu-help"><a class="btn" ng-click="planeHelp()">'
            +'<span class="glyphicon glyphicon-info-sign"></span></div>'
            +'</div>',
            replace: true,
            transclude:true,
            scope: {
            	pinned : '=pinned',
            	navClicked: '&navClicked',
            	settingsClicked: '&settingsClicked',
            	helpClicked: '&helpClicked',

            },
            link: function link(scope, element, attrs) {
            	var state = {
            		opened : false,
            		menu : 'nav'
            	};

            	function toggleNav(menu) {
            		if (!scope.pinned) {
	            		if ((state.menu == menu) || !state.opened) {
		            		var nav = angular.element(element[0]);
		            		if (nav.hasClass('sidenav-show')) {
		            			nav.removeClass('sidenav-show');
		            			nav.addClass('sidenav-hide');
		            			state.opened = false;
		            		} else {
		            			nav.removeClass('sidenav-hide');
		            			nav.addClass('sidenav-show');
		            			state.opened = true;
		            		}
	            		}
            		}
          			state.menu = menu;
            	}

            	scope.pinNav = function() {
            		scope.pinned = !scope.pinned;
            	};

            	scope.planeNav = function() {
            		toggleNav('nav');
            		scope.navClicked();
            	}

            	scope.planeSettings = function() {
           			toggleNav('settings');
            		scope.settingsClicked();
            	}

            	scope.planeHelp = function() {
           			toggleNav('help');
            		scope.helpClicked();
            	}

            	toggleNav();

            }
        }
});