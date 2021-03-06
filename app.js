// set variables for environment
var fs = require('fs');
var config = require('config-node')();
var express = require('express');
var events = require('events');
var bodyParser = require('body-parser');
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');
var datalayer = require('./models/datalayer');
var GeoTools = require('./models/geotools');
var Dump1090 = require('./models/dump1090');
var VirtualRadar = require('./models/virtualradar');
//var planefinder = require('./models/planefinder');
var extend = require('util')._extend;
var node_config = process.env.NODE_ENV || 'development';
var geotools = new GeoTools();
// Database 
var db = new datalayer();
db.connect();
console.log('Database initialized');
// Express server
var app = express();
// Planes information list 
var planes = new Array();
// Client list
var clients = new Array();

// Set server port
var server = app.listen(config.HttpServer.port);

var websocket = io.listen(server);

// listen websocket on suburl
var flight = websocket.of('/socket/flight');

console.log('server is running');

//Function tools
function saveAircraft(adsb,callsign) {
	db.getAircraft(adsb).then(function(data) { 
		if (data.count == 0) {
/*			var plane = new planefinder();		
			console.log('save aircraft '+adsb+' callsign='+callsign);
			plane.getPlaneInfo(adsb, callsign,Date.now()).once('data', function(data) {
				if (data != '') {
					var item = { ModeS : adsb, Registration : data.aircraft.Registration, 
									CodeType : data.aircraft.code, ModelType : data.aircraft.Model, 
									Manufacturer : data.plane.manufacturer, Engines : data.plane.engines, 
									DesignatorType : data.plane.typeDesignator, BaseTown : data.aircraft.base,
									FlightName :data.flight.pink_flight, Operator : data.aircraft.Operator};
					try {				
						if (data.flight.depapt!='') {
							item.Airport = { 
									departure :
										{Code : data.flight.depapt, Town:data.route[data.flight.depapt][0],
										Country : data.route[data.flight.depapt][1],
										AirportName : data.route[data.flight.depapt][2],
										Longitude : data.route[data.flight.depapt][3],
										Latitude : data.route[data.flight.depapt][4],
										AirportCode : data.route[data.flight.depapt][6]},
									arrival : 
										{Code : data.flight.arrapt, Town:data.route[data.flight.arrapt][0],
										Country : data.route[data.flight.arrapt][1],
										AirportName : data.route[data.flight.arrapt][2],
										Longitude : data.route[data.flight.arrapt][3],
										Latitude : data.route[data.flight.arrapt][4],
										AirportCode : data.route[data.flight.arrapt][6]}
										};
						}
					} catch(e) {
						console.log(e.message);
					}
					// Save data
					console.log('save aircraft '+adsb+' saved !!');
					db.addAircraft( item);
				}	
			});*/
		}
	});	
}


// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // use either jade or ejs       
// instruct express to server up static assets
app.use(express.static('public'));
app.use(bodyParser.json());

// set routes
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/partial/:name', function(req, res) {
  res.render('partial/'+req.params.name);
});

app.get('/rest/settings/read', function (req, res) {
	res.json(JSON.parse(fs.readFileSync('config/'+node_config+'.json', 'utf8')));
	//res.json(eval('config.'+req.params.section));
});

app.post('/rest/settings/write/:section', function (req,res) {
	fs.writeFile('config/'+node_config+'.json', JSON.stringify(req.body), function (err) {
	  if (err) return console.log(err);
	  console.log('Write file success !');
	  // reinit station
	  initializeStation();
	});
	// reload config
	config = require('config-node')();
});

app.get('/rest/coverage', function(req,res) {
	// get coverage points
	var coverage = [];
	db.getCoverage().then(function(data) {
		// loop on points
		//console.log(data.rows);
		for (var id in data.rows) {
			var point = data.rows[id].dataValues;
			// add points to array and compute bearing
			point.bearing = geotools.getBearing(config.Location.Latitude, config.Location.Longitude,
								point.Latitude, point.Longitude);
			point.distance = geotools.getDistanceFromLatLonInKm(config.Location.Latitude, config.Location.Longitude,
								point.Latitude, point.Longitude);
			coverage.push(point);
		}
		//sort per bearing value
		coverage.sort(function(p1,p2) {return p1.bearing-p2.bearing});
		// return as json
		res.json(coverage);
	});
});

app.get('/rest/airports', function(req,res) {
	// get airports coords
	var airports = [];
	db.getAirports().then(function(data) {
		for (var id in data.rows) {
			airports.push(data.rows[id].dataValues);
		}
		res.json(airports);
	});
});

app.get('/rest/aircraft/history/:adsb', function (req, res) {
	if (req.params.adsb != '') {
		for (var id in planes) {		
			if (planes[id].ICAO == req.params.adsb) {
				if (planes[id].trackhistory) {
					res.json({trackhistory:planes[id].trackhistory});
				} else {
					res.json({trackhistory:undefined});
				}
			}
		}
	} else
		res.json({trackhistory:undefined});
});

app.get('/rest/aircraft/info/:adsb', function (req, res) {
	db.getAircraft(req.params.adsb, res).then(function(data) {
		if (data.count > 0) {
			res.json(data.rows[0]);
		} else {
			res.json({ModeS:000000});
		}
	});
});

app.get('/rest/aircraft/search/:search', function (req, res) {
	db.searchAircraft(req.params.search, res).then(function(data) {
		res.json(data);
	});
});


app.get('/rest/flight/:adsb', function (req, res) {
	var adsb = req.params.adsb;
	var planeId = -1;
	for (var id in planes) {		
		if (planes[id].ICAO == adsb) {
			planeId = id;
			break;
		}
	}
	if ((planeId != -1 ) && (planes[planeId].callsign!= undefined)) {
		/*var plane = new planefinder();		
		plane.getPlaneInfo(adsb, planes[planeId].callsign,Date.now()).once('data', function(data) {
			if (data != '') {
				var item = { ModeS : adsb, Registration : data.aircraft.Registration, 
								CodeType : data.aircraft.code, ModelType : data.aircraft.Model, 
								Manufacturer : data.plane.manufacturer, Engines : data.plane.engines, 
								DesignatorType : data.plane.typeDesignator, BaseTown : data.aircraft.base,
								FlightName :data.flight.pink_flight, Operator : data.aircraft.Operator};
				if ((data.flight.depapt) && (data.route)) {
					item.Airport = { 
							departure :
								{Code : data.flight.depapt, Town:data.route[data.flight.depapt][0],
								Country : data.route[data.flight.depapt][1],
								AirportName : data.route[data.flight.depapt][2],
								Latitude : data.route[data.flight.depapt][3],
								Longitude : data.route[data.flight.depapt][4],
								AirportCode : data.route[data.flight.depapt][6],
								DepartureTime: data.flight.deptim},
							arrival : 
								{Code : data.flight.arrapt, Town:data.route[data.flight.arrapt][0],
								Country : data.route[data.flight.arrapt][1],
								AirportName : data.route[data.flight.arrapt][2],
								Latitude : data.route[data.flight.arrapt][3],
								Longitude : data.route[data.flight.arrapt][4],
								AirportCode : data.route[data.flight.arrapt][6],
								ArrivalTime: data.flight.arrtim}
								};
				}
				if (data.photos) {
					item.Photos = data.photos;
				}
			}
			res.json(item);
			res.end();
		});*/
	}
});

// listen to socket.io connection
flight.on('connection', function(socket) {
	console.log('User connected');
	// Add Client to list
	clients.push(socket);
	flight.emit('client_count', clients.length);
	// Send all flight to client
	for (var id in planes) {
		if (!planes[id].out_of_bound) {
			// Empty trackhistory
			var planecopy = extend({}, planes[id]);
			planecopy.trackhistory = [];
			socket.emit('add',planecopy);
		}
	}
	socket.on('disconnect', function() {
		console.log('bye bye !');
		for (var clientid in clients) {
			if (this.id == clients[clientid].id) {
				clients.splice(clientid,1);
				console.log('Clients remain '+clients.length);
				flight.emit('client_count', clients.length);
			}
		}
	});

});

// Flight alert for out of bound
var flightalert = setInterval( function() {
	// Check time delta for each plane
	for (var id in planes) {
		var current = planes[id];
		// update watchdog since last call
		current.watchdog += config.Plane.refresh_time/1000;
		// Empty trackhistory
		var seenDelta = (Date.now() - new Date(current.live_time)) / 1000;
		//console.log("plane "+current.ICAO+" seen since "+seenDelta);
		if ((seenDelta < config.Plane.quality.good.seen) && (current.quality != 100)) {
			current.quality = 100;
			flight.emit('quality', {ICAO:current.ICAO, quality:current.quality });
			//console.log('Change quality to '+ current.quality +' for '+current.ICAO);
		}
		if ((seenDelta > config.Plane.quality.good.seen) && (seenDelta < config.Plane.quality.poor.seen) && (current.quality != 50)) {
			current.quality = 50;
			flight.emit('quality', {ICAO:current.ICAO, quality:current.quality });
			//console.log('Change quality to '+ current.quality +' for '+current.ICAO);
		}
		if ((seenDelta > config.Plane.quality.poor.seen) && (seenDelta < config.Plane.quality.bad.seen) && (current.quality != 20)) {
			current.quality = 20;
			flight.emit('quality', {ICAO:current.ICAO, quality:current.quality });
			//console.log('Change quality to '+ current.quality +' for '+current.ICAO);
		}
		if ((seenDelta > config.Plane.memory.timeout_client) && (!current.out_of_bound))  { // 1 minutes delta ?
			current.out_of_bound = true;
			if (current.latitude!=null)
				db.addCoverage({Altitude : current.altitude, Latitude : current.latitude, Longitude : current.longitude});
			flight.emit('delete', {ICAO:current.ICAO, quality:current.quality });
			//console.log('Change quality to '+ current.quality +' for '+current.ICAO);
		}
		// After outbound of 3 minutes delte it
		if (current.watchdog > config.Plane.memory.timeout_server) {
			planes.splice(id,1);
		}
	}
}, config.Plane.refresh_time);	

function stationError(msg) {
	console.log(msg);
}

function stationMessage(msg) {
	if (msg.message_type === sbs1.MessageType.TRANSMISSION) {
		var found = false;
	  	for (var id in planes) {
	  		if (planes[id].ICAO == msg.hex_ident) {
	  			found = true;
			  	var current = planes[id];
			  	var currentmsg = {};
			  	currentmsg.ICAO = msg.hex_ident;
			  	var changed = false;
		  		if ((msg.track != null) && (current.track != msg.track)) {
		  			current.track= msg.track;
		  			currentmsg.track = current.track;	
		  			changed = true;
		  		}
		  		if ((msg.callsign != null) && (current.callsign != msg.callsign)) {
		  			current.callsign = msg.callsign;
		  			currentmsg.callsign = current.callsign;
		  			// save aircraft
		  			saveAircraft(msg.hex_ident,current.callsign);
		  			changed = true;

		  		}
		  		if ((msg.ground_speed != null) && (current.ground_speed != Math.floor(msg.ground_speed))) {
		  			current.ground_speed = Math.floor(msg.ground_speed); // km/h from knots  * 1.8520
		  			currentmsg.ground_speed = current.ground_speed;
		  			changed = true;
		  		}
		  		if ((msg.vertical_rate != null) && (current.vertical_rate != Math.floor(msg.vertical_rate))) {
		  			current.vertical_rate = Math.floor(msg.vertical_rate); // m/s from knots  * 1.8520
		  			currentmsg.vertical_rate = current.vertical_rate;
		  			changed = true;
		  		}
		  		if ((msg.squawk != null) && (current.squawk != msg.squawk)) {
		  			current.squawk = msg.squawk;
		  			currentmsg.squawk =current.squawk;
		  			changed = true;
		  		}
		  		if ((msg.altitude != null) && (current.altitude != Math.floor(msg.altitude))) {
		  			current.altitude = Math.floor(msg.altitude); // feet en m  * 0.3048
		  			currentmsg.altitude = current.altitude;
		  			changed = true;
		  		}
		  		if (((msg.lat != null) && (msg.lon!=null)) && ((current.longitude != msg.lon) || (current.latitude != msg.lat))) {
					if (current.trackhistory == undefined) {
						current.trackhistory = new Array();
					}
					if (current.latitude!=null) {
						var color = {};
						if (current.altitude < 7000) {
						  color = geotools.makeGradientColor({r:0,g:255,b:0}, {r:1,g:169,b:219}, (current.altitude * 100 / 7000));
						} else if (current.altitude < 15000) {
						  color = geotools.makeGradientColor({r:1,g:169,b:219}, {r:169,g:1,b:219}, ((current.altitude-7000) * 100 / 7000));
						} else {
						color = geotools.makeGradientColor({r:169,g:1,b:219}, {r:223,g:1,b:86}, ((current.altitude-15000) * 100 / 15000));
						}
          				var lineColor = { 'color':color.cssColor, 'opacity':1.0,'weight':3 };
          				// compute bearing
          				var bearing = Math.abs(geotools.getBearing(current.latitude, current.longitude, msg.lat, msg.lon) - current.track);
          				var delta_altitude = Math.abs(current.altitude - Math.floor(msg.altitude)); //  * 0.3048
          				// Reduce point using bearing and altitude
          				if ((bearing > 5) || (current.trackhistory.length == 0)) {
							current.trackhistory.push( { id : current.trackhistory.length, track : [{ 'latitude':current.latitude,'longitude':current.longitude},{'latitude':msg.lat,'longitude':msg.lon}], color : lineColor } );
          				} else {
          					// Modify last coord point with current
          					current.trackhistory[current.trackhistory.length -1].track[1].longitude = msg.lon;
          					current.trackhistory[current.trackhistory.length -1].track[1].latitude = msg.lat;
          				}
					} else {
						// new plane localisation, add it to db
						db.addCoverage({Altitude : msg.altitude, Latitude : msg.lat, Longitude : msg.lon});						
					}
					current.latitude = msg.lat;
					current.longitude = msg.lon;
					currentmsg.latitude = current.latitude;
					currentmsg.longitude = current.longitude;
					changed = true;
		  		}	
		  		if (changed) {
			  		// Plane is back ?
			  		if (current.out_of_bound) {
						current.out_of_bound = false;
						// Empty trackhistory
						var planecopy = extend({}, current);
						planecopy.trackhistory = [];
			  			flight.emit('add', planecopy);
			  			//console.log('readd '+ planecopy.ICAO);
			  		} else {
			  			flight.emit('change',currentmsg);
			  			//console.log('change '+ currentmsg.ICAO);
			  		}
		  		}
		  		// reset watchdog
		  		current.watchdog = 0;
		  		// update live time
		  		current.live_time = new Date().toJSON();
		  	}
		}
		// if not found add it
		if (!found) {
			var sendmsg = {'ICAO':msg.hex_ident,'latitude' : msg.lat, 'longitude' : msg.lon, 
											'track': 0, 'callsign' : 'unknown', 'ground_speed':0, 
											'altitude' : 0, 'vertical_rate':0, 'squawk' : 0, 'out_of_bound' : false, 
											'live_time': new Date().toJSON(), 'quality':100, 'trackhistory' : [], 'watchdog': 0};
			planes.push(sendmsg);
			flight.emit('add',sendmsg);			
  			//console.log('add '+ sendmsg.ICAO);
		}			
	}
}

// Loop over Receiver
function initializeStation() {
	var stations = [];
	var receivers = config.Receivers;
	for (var id in receivers) {
		var receiver = receivers[id];
		if (!receiver.Enable)
			continue;
		var options = { host: receiver.Host, port:receiver.Port, url:receiver.Url};
		var station = {};
		switch(receiver.Type) {
			case 'DUMP1090' : station = new Dump1090(options); break;
			case 'VIRTUALRADAR' : station = new VirtualRadar(options); break;
			case 'LIVE' : station = sbs1.createClient(options); break;
		}
		// Set station listener
		station.on('error', stationError);
		station.on('message', stationMessage);
		// push station to list
		stations.push({
			station : station,
			type : receiver.Type,
			name : receiver.Name,
			timer : (receiver.Type != 'LIVE') ? setInterval( function() { for (var id in stations) if (stations[id].type!='LIVE') stations[id].station.getPlanes(); },receiver.Refresh) : null
		});
	}
}

// Start listener
initializeStation();
