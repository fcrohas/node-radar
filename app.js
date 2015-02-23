// set variables for environment
var config = require('config-node')();
var express = require('express');
var events = require('events');
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');
var datalayer = require('./models/datalayer');
var planefinder = require('./models/planefinder');

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

// Connect to ads-b server
var options = { host: config.SBS.host, port:config.SBS.port};
var baseStation = sbs1.createClient(options);

// Set server port
var server = app.listen(config.HttpServer.port);

var websocket = io.listen(server);
websocket.set('destroy upgrade',false);

// listen websocket on suburl
var flight = websocket.of('/socket/flight');

console.log('server is running');

//Function tools
function saveAircraft(adsb,callsign) {
	db.getAircraft(adsb).complete(function(err,data) { 
		if (data.count == 0) {
			var plane = new planefinder();		
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
			});
		}
	});	
}


// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // use either jade or ejs       
// instruct express to server up static assets
app.use(express.static('public'));

// set routes
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/partial/:name', function(req, res) {
  res.render('partial/'+req.params.name);
});

app.get('/rest/settings/read/:section', function (req, res) {
	res.json(eval('config.'+req.params.section));
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
	db.getAircraft(req.params.adsb, res).complete(function(err,data) {
		if (data.count > 0) {
			res.json(data.rows[0]);
		} else {
			res.json({ModeS:000000});
		}
	});
});

app.get('/rest/aircraft/search/:search', function (req, res) {
	db.searchAircraft(req.params.search, res).complete(function(err,data) {
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
		var plane = new planefinder();		
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
								Longitude : data.route[data.flight.depapt][3],
								Latitude : data.route[data.flight.depapt][4],
								AirportCode : data.route[data.flight.depapt][6],
								DepartureTime: data.flight.deptim},
							arrival : 
								{Code : data.flight.arrapt, Town:data.route[data.flight.arrapt][0],
								Country : data.route[data.flight.arrapt][1],
								AirportName : data.route[data.flight.arrapt][2],
								Longitude : data.route[data.flight.arrapt][3],
								Latitude : data.route[data.flight.arrapt][4],
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
		});
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
			socket.emit('add',planes[id]);
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
	// compute delta time
	var timeOffset = new Date().getTimezoneOffset() * 60; // get it in seconds
	var delta = (Date.now() / 1000) + timeOffset;
	//console.log("Delta time is "+delta+" with time zone "+timeOffset);
	// Check time delta for each plane
	for (var id in planes) {
		var current = planes[id];
		var seenDelta = Math.floor(delta - (current.live_time / 1000) - current.delta_time);
		//console.log("plane "+current.ICAO+" seen since "+seenDelta);
		if ((seenDelta < config.Plane.quality.good.seen) && (current.quality != 100)) {
			current.quality = 100;
			flight.emit('quality',current);
		}
		if ((seenDelta > config.Plane.quality.good.seen) && (seenDelta < config.Plane.quality.poor.seen) && (current.quality != 50)) {
			current.quality = 50;
			flight.emit('quality',current);
		}
		if ((seenDelta > config.Plane.quality.poor.seen) && (seenDelta < config.Plane.quality.bad.seen) && (current.quality != 20)) {
			current.quality = 20;
			flight.emit('quality',current);
		}
		if ((seenDelta > config.Plane.memory.timeout_client) && (!current.out_of_bound))  { // 1 minutes delta ?
			current.out_of_bound = true;
			console.log("ICAO="+current.ICAO+' time='+seenDelta);
			flight.emit('delete',current);
		}
		// After outbound of 3 minutes delte it
		if (seenDelta > config.Plane.memory.timeout_server) {
			var log = 'ICAO='+planes[id].ICAO+' , length='+planes.length+' ';
			planes.splice(id,1);
			log += 'after splice='+planes.length;
			console.log(log);
		}
	}
}, config.Plane.refresh_time);	

baseStation.on('message', function(msg) {
	if (msg.message_type === sbs1.MessageType.TRANSMISSION) {
		var found = false;
	  	for (var id in planes) {
	  		if (planes[id].ICAO == msg.hex_ident) {
	  			found = true;
			  	var current = planes[id];
			  	var currentmsg = {};
			  	currentmsg.ICAO = msg.hex_ident;
			  	var changed = false;
		  		if (((msg.lat != null) && (msg.lon!=null)) && ((current.longitude != msg.lon) || (current.latitude != msg.lat))) {
					if (current.trackhistory == undefined) {
						current.trackhistory = new Array();
					}
					if (current.latitude!=undefined)
						current.trackhistory.push( { 'latitude':current.latitude,'longitude':current.longitude});
					current.latitude = msg.lat;
					current.longitude = msg.lon;
					currentmsg.latitude = current.latitude;
					currentmsg.longitude = current.longitude;
					changed = true;
		  		}
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
		  		if ((msg.ground_speed != null) && (current.ground_speed != msg.ground_speed)) {
		  			current.ground_speed = Math.floor(msg.ground_speed * 1.8520); // km/h from knots
		  			currentmsg.ground_speed = current.ground_speed;
		  			changed = true;
		  		}
		  		if ((msg.vertical_rate != null) && (current.vertical_rate != msg.vertical_rate)) {
		  			current.vertical_rate = Math.floor(msg.vertical_rate * 1.8520); // m/s from knots
		  			currentmsg.vertical_rate = current.vertical_rate;
		  			changed = true;
		  		}
		  		if ((msg.squawk != null) && (current.squawk != msg.squawk)) {
		  			current.squawk = msg.squawk;
		  			currentmsg.squawk =current.squawk;
		  			changed = true;
		  		}
		  		if ((msg.altitude != null) && (current.altitude != msg.altitude)) {
		  			current.altitude = Math.floor(msg.altitude * 0.3048); // feet en m
		  			currentmsg.altitude = current.altitude;
		  			changed = true;
		  		}
		  		if ((msg.logged_time != null) && (current.logged_time != msg.logged_time)) {
		  			current.live_time = msg.logged_timestamp();
		  			currentmsg.live_time = current.live_time;
		  			changed = true;
		  		}
		  		if (changed) {
			  		// Plane is back ?
			  		if (current.out_of_bound) {
						current.out_of_bound = false;		  			
			  			flight.emit('add', current);
			  		} else {
			  			flight.emit('change',currentmsg);
			  		}
		  		}
		  	}
		}
		// if not found add it
		if (!found) {
			// compute server time
			var timeOffset = new Date().getTimezoneOffset() * 60; // get it in seconds
			var delta = (Date.now() / 1000) + timeOffset;
			// compute delta with logged_time
			var delta_time = Math.floor(delta - (msg.logged_timestamp() / 1000));
			var sendmsg = {'ICAO':msg.hex_ident,'latitude' : msg.lat, 'longitude' : msg.lon, 
											'track': 0, 'callsign' : 'unknown', 'ground_speed':0, 
											'altitude' : 0, 'vertical_rate':0, 'squawk' : 0, 'out_of_bound' : false, 
											'live_time': msg.logged_timestamp(), 'delta_time': delta_time,'quality':100};
			planes.push(sendmsg);
			flight.emit('add',sendmsg);			
		}			
	}
});



