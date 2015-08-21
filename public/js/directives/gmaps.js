angular.module('directives').directive('gmaps', ['$http','$window','$filter',function factory($http,$window,$filter) {
	var _markers = [];
	var coverage = {};
	var airports = [];
	// google.maps.Marker.prototype.setLabel = function(label){
	//         this.label = new MarkerLabel({
	//           map: this.map,
	//           marker: this,
	//           text: label
	//         });
	//         this.label.bindTo('position', this, 'position');
	//     };

	//     var MarkerLabel = function(options) {
	//         this.setValues(options);
	//         this.span = document.createElement('span');
	//         this.span.className = 'map-marker-label';
	//     };

	//     MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
	//         onAdd: function() {
	//             this.getPanes().overlayImage.appendChild(this.span);
	//             var self = this;
	//             this.listeners = [
	//             google.maps.event.addListener(this, 'position_changed', function() { self.draw();    })];
	//         },
	//         draw: function() {
	//             var text = String(this.get('text'));
	//             var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
	//             this.span.innerHTML = text;
	//             this.span.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 10 + 'px';
	//             this.span.style.top = (position.y - markerSize.y + 40) + 'px';
	//         }
	//     });
        function addMarker(map, marker, isVisible) {
        	_markers[marker.ICAO] = {};
            _markers[marker.ICAO].marker = new google.maps.Marker({
                position: new google.maps.LatLng(marker.latitude, marker.longitude),
                map: map,
                icon : marker.icon,
                title: marker.callsign || marker.ICAO,
                visible: isVisible || false
            });
            _markers[marker.ICAO].info = new google.maps.InfoWindow({
					content: "<div><h6>No information</h6></div>",
					maxWidth : 200
			});
			google.maps.event.addListener(_markers[marker.ICAO].marker, 'click', function() {
				$http.get('/rest/flight/'+marker.ICAO).then(function(response) {
					var info = response.data;
					var content = "<div><h6>"+info.Registration+"</h6>";
					content += "<small>Type : "+info.Manufacturer+" - "+info.ModelType;
					content += "<br>Operator : "+info.Operator;
					if (info.Airport) {
						content += "<br>Flight : "+info.FlightName;
						content += "<br>From : "+info.Airport.departure.AirportName;
						content += "<br>To : "+info.Airport.arrival.AirportName;
					}
					if ((info.Photos!= undefined) && (info.Photos.length>0)) {
						content += "<br><img class='thumb' src='"+info.Photos[0].thumbnailPath+"'></img>";
						content += "<br>By "+info.Photos[0].author;
					}
					content += "</small></div>";

					_markers[marker.ICAO].info.setContent(content);
				});
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
                settings: '=settings',
                filter: '=filter'
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
                	scope.$watch('filter', function(newValue,oldValue,scope) {
                			if (newValue != '') {
                				//scope.$applyAsync(function () {
		                			var markersFiltered = $filter('filter')(scope.markers,newValue);
		                			for(var id in _markers) {
		                				var marker = _markers[id];
		                				if (marker.marker!=undefined) {
		                					marker.marker.setVisible(false);
		                				}
		                			};
		                			angular.forEach(markersFiltered, function(marker) {
		                				if ((_markers[marker.ICAO]!=undefined) &&  (_markers[marker.ICAO].marker!=undefined))
		                					_markers[marker.ICAO].marker.setVisible(true);
		                			});
	                			//});
	                		} else {
	                			for(var id in _markers) {
	                				var marker = _markers[id];
	                				if (marker.marker!=undefined) {
	                					marker.marker.setVisible(true);
	                				}
	                			};
		                	}
                	});

                	scope.$watch('markers', function(newValues,oldValues,scope) {
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
			                    		var isVisible = $filter('filter')([markerNew],scope.filter);
			                    		addMarker(map, markerNew, isVisible.length >0);
				                	}
			                	} else
			                	// update marker
			                	{
			                		//console.log(markerNew.marker);
			                		// update or create marker if latitude is new 
			                		if ((markerNew.latitude != markerOld.latitude) || (markerNew.longitude != markerOld.longitude)) {
			                			if (_markers[markerNew.ICAO] == undefined) {
			                				var isVisible = $filter('filter')([markerNew],scope.filter);
											addMarker(map, markerNew, isVisible.length >0);
			                			} else {
			                				if (_markers[markerNew.ICAO].marker.getVisible()) {
				                				if ((markerNew.show) && (scope.settings.trackplane)) {
				                					map.panTo(new google.maps.LatLng(markerNew.latitude, markerNew.longitude));
				                				}
				                				_markers[markerNew.ICAO].marker.setPosition(new google.maps.LatLng(markerNew.latitude, markerNew.longitude));
				                				// _markers[markerNew.ICAO].marker.setLabel(markerNew.callsign);
				                				// update track history
				                				if ((markerNew.show == true) && (_markers[markerNew.ICAO].track != undefined)) {
				                					if (markerNew.trackhistory.length != markerOld.trackhistory.length) {
				                						addPolyline(map, markerNew, markerNew.trackhistory.length -1);
				                					} else {
				                						updatePolyline(map, markerNew);
				                					}
				                					
				                				}
			                				}
			                			}
				                		//console.log('updated marker');

			                		}
		                			if (_markers[markerNew.ICAO] !=  undefined) {
		                				if (_markers[markerNew.ICAO].marker.getVisible()) {
					                		if (markerNew.callsign != markerOld.callsign) {
				                				_markers[markerNew.ICAO].marker.setTitle(markerNew.callsign);
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
    }]);