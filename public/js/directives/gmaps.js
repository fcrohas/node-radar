angular.module('directives').directive('gmaps', function factory($window) {
		var _markers = [];
		var coverage = {};
		var airports = [];
        function addMarker(map, marker) {
        	_markers[marker.ICAO] = {};
            _markers[marker.ICAO].marker = new google.maps.Marker({
                position: new google.maps.LatLng(marker.latitude, marker.longitude),
                map: map,
                icon : marker.icon,
                title: marker.callsign || marker.ICAO
            });
            _markers[marker.ICAO].info = new google.maps.InfoWindow({
					content: "<div>"
							+"<h6>"+marker.callsign+"</h6>"
							+"<small>"+marker.description
							+"<br>Squawk: " + marker.squawk
							+"<br>Altitude: "+marker.altitude+" m"
							+"<br>Speed: "+marker.ground_speed+" km/h"
							+"</small></div>"
			});
			google.maps.event.addListener(_markers[marker.ICAO].marker, 'click', function() {
				_markers[marker.ICAO].info.open(map,_markers[marker.ICAO].marker);
			});
        }

        function addPolyline(map, marker, id) {
			var track = marker.trackhistory[id];
			var path = [
				new google.maps.LatLng(track.track[0].latitude, track.track[0].longitude),
				new google.maps.LatLng(track.track[1].latitude, track.track[1].longitude)
			];
			_markers[marker.ICAO].track.push(new google.maps.Polyline({path : path, geodesic : true, strokeColor: track.color.color, visible: true, map: map, strokeOpacity: 1.0, strokeWeight: 3.0}));

        }

        function updatePolyline(map, marker) {
        	// get last polylne path
        	var polyline = _markers[marker.ICAO].track[_markers[marker.ICAO].track.length - 1];
        	var path = polyline.getPath();
        	// update path
        	path.push(new google.maps.LatLng(marker.latitude, marker.longitude));
			polyline.setPath(path);       	
        }

        return {
            restrict: 'EA',
            template: '<div class="full-height mainView"></div>',
            replace: true,
            transclude:true,
            scope: {
                zoom: '=zoom',
                center: '=center',
                markers: '=markers',
                options: '=options',
                coverage: '=coverage',
                airports: '=airports',
                settings: '=settings'
            },
            link: function link(scope, element, attrs) {
            	var map = {};
                var mapOptions = {
                    center: new google.maps.LatLng(scope.center.latitude, scope.center.longitude),
                    zoom: scope.zoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    options : scope.options
                };

                function initialize() {
                	map = new google.maps.Map(element[0], mapOptions);
                	scope.$watch('markers', function(newValues,oldValues,scope) {
                			//console.log(newValues);
	                    	for (var index in newValues) {
	                    		var markerNew = newValues[index];
	                    		var markerOld = oldValues.filter(function(plane) {
	                    			return (plane.ICAO == markerNew.ICAO);
	                    		});
	                    		if (markerOld.length == 0) 
	                    			markerOld = undefined;
	                    		else markerOld = markerOld[0];
								// create new marker if it does not exist
								//console.log(markerOld);
			                    if (markerOld == undefined) {
			                    	//console.log('added marker');
			                    	// add created marker to object if lat / lon are there
			                    	if ((markerNew.latitude != null) && (markerNew.latitude != undefined)) {
			                    		addMarker(map, markerNew);
				                	}
			                	} else
			                	// update marker
			                	{
			                		//console.log(markerNew.marker);
			                		// update or create marker if latitude is new 
			                		if ((markerNew.latitude != markerOld.latitude) || (markerNew.longitude != markerOld.longitude)) {
			                			if (_markers[markerNew.ICAO] == undefined) {
											addMarker(map, markerNew);
			                			} else {
			                				if ((markerNew.show) && (scope.settings.trackplane)) {
			                					map.panTo(new google.maps.LatLng(markerNew.latitude, markerNew.longitude));
			                				}
			                				_markers[markerNew.ICAO].marker.setPosition(new google.maps.LatLng(markerNew.latitude, markerNew.longitude));
			                				// update track history
			                				if ((markerNew.show == true) && (_markers[markerNew.ICAO].track != undefined)) {
			                					if (markerNew.trackhistory.length != markerOld.trackhistory.length) {
			                						addPolyline(map, markerNew, markerNew.trackhistory.length -1);
			                					} else {
			                						updatePolyline(map, markerNew);
			                					}
			                					
			                				}
			                			}
				                		//console.log('updated marker');

			                		}
		                			if (_markers[markerNew.ICAO] !=  undefined) {
				                		if (markerNew.callsign != markerOld.callsign) {
			                				_markers[markerNew.ICAO].marker.setTitle(markerNew.callsign);
				                		}
				                		if ((markerNew.squawk != markerOld.squawk) || (markerNew.altitude != markerOld.altitude) || (markerNew.ground_speed!=markerOld.ground_speed)) {
			                				_markers[markerNew.ICAO].info.setContent("<div>"
														+"<h6>"+markerNew.callsign+"</h6>"
														+"<small>"+markerNew.description
														+"<br>Squawk: " + markerNew.squawk
														+"<br>Altitude: "+markerNew.altitude+" m"
														+"<br>Speed: "+markerNew.ground_speed+" km/h"
														+"</small></div>");		
				                		}

				                		if ((markerNew.track != markerOld.track) 
				                			|| (markerNew.quality!=markerOld.quality)
				                			|| (markerNew.icon.path != markerOld.icon.path)
				                			|| (markerNew.show != markerOld.show)) {
			                				_markers[markerNew.ICAO].marker.setIcon(markerNew.icon);
			                				if ((markerNew.show) && (scope.settings.trackplane)) {
			                					map.panTo(new google.maps.LatLng(markerNew.latitude, markerNew.longitude));
			                				}
				                		}

				                		if (markerNew.trackhistory.length != markerOld.trackhistory.length) {
				                			if (markerOld.trackhistory.length == 0) {
				                				_markers[markerNew.ICAO].track = [];
				                				for (var trackid in markerNew.trackhistory) {
				                					addPolyline(map, markerNew, trackid);
				                				}
				                			}
				                		}

				                		if ((markerNew.show != markerOld.show) && (markerNew.show == false)) {
				                			for (var id in _markers[markerNew.ICAO].track) {
				                				var track = _markers[markerNew.ICAO].track[id];
				                				track.setMap(null);
				                			}
				                		}

				                	}	
		                		}
			                }
			                // loop for deleted marker only
			                if (oldValues.length > newValues.length) {
			                	// some are deleted
			                	//console.log('start delete');
			                	for (var id in oldValues) {
			                		var markerOld = oldValues[id];
			                		var markerNew = newValues.filter(function(item) {
			                			return (item.ICAO == markerOld.ICAO);
			                		});
			                		// If markerNew empty it was deleted
									// create new marker if it does not exist
				                    if (markerNew.length == 0) {
				                    	//console.log('deleted marker');
				                    	if (_markers[markerOld.ICAO] != undefined) {
				                    		_markers[markerOld.ICAO].marker.setMap(null);
					                    	if (_markers[markerOld.ICAO].track != undefined) {
					                			for (var id in _markers[markerOld.ICAO].track) {
					                				var track = _markers[markerOld.ICAO].track[id];
					                				track.setMap(null);
					                			}
				                			}
				                		}
					                    //delete _markers[markerOld.ICAO];
					                    //console.log(markerOld.ICAO);
					                    for (var index in _markers) {
					                    	if (_markers[index].ICAO == markerOld.ICAO)
					                    		_markers.splice(index,1);	
					                    }
					                    
				                	}
				                } 		                	
				                //console.log('end delete');
			                }
	               	},true);

					scope.$watch('coverage', function(newValues,oldValues,scope) {
						if (newValues.length > oldValues.length) {
							var polygon = [];
							for (var id in newValues) {
								var point = newValues[id];
								//console.log(point);
								if (point.distance < 50)
									continue;
								polygon.push(new google.maps.LatLng(point.Latitude, point.Longitude));
							}
							coverage = new google.maps.Polygon({
								paths: polygon,
								strokeColor: '#FF0000',
								strokeOpacity: 0.5,
								strokeWeight: 1,
								fillColor: '#FF0000',
								fillOpacity: 0.15
							});
							coverage.setMap(map);
						} else {
							if (coverage.setMap != undefined)
								coverage.setMap(null);
						}
					});

					scope.$watch('airports', function(newValues,oldValues, scope) {
						if (newValues.length > oldValues.length) {
							for (var id in newValues) {
								var airport = newValues[id];
					        	airports[airport.Code] = {};
					            airports[airport.Code].marker = new google.maps.Marker({
					                position: new google.maps.LatLng(airport.Longitude, airport.Latitude),
					                map: map,
					                icon : '/img/airport.png',
					                title: airport.Town+" - "+airport.AirportName+"("+airport.AirportCode+")"
					            });
							}
						} else {
							for (var id in oldValues) {
								var airport = oldValues[id];
								airports[airport.Code].marker.setMap(null);
							}
						}
					});

	                google.maps.event.addListener(map, 'zoom_changed', function () {
	                    scope.$applyAsync(function () {
	                        scope.zoom = map.getZoom();
	                    });
	                });

                }

                google.maps.event.addDomListener($window, 'load', initialize);
            }
        };
    });