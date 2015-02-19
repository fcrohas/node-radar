// set variables for environment
var config = require('config-node')();
var express = require('express');
var events = require('events');
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');
var planefinder = require('./models/planefinder');

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
  console.log('partial/'+req.params.name);
  res.render('partial/'+req.params.name);
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
	if (planes[planeId].callsign!= undefined) {
		var plane = new planefinder();		
		plane.getPlaneInfo(adsb, planes[planeId].callsign,Date.now()).once('data', function(data) {
			res.json(data);
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
		  		if ((current.longitude != msg.lon) || (current.latitude != msg.lat)) {
					if (current.trackhistory == undefined) {
						current.trackhistory = new Array();
					}
					if ((current.latitude != null) && (current.longitude!=null))
						current.trackhistory.push( { 'latitude':current.latitude,'longitude':current.longitude});
					current.latitude = msg.lat;
					current.longitude = msg.lon;
					currentmsg.latitude = current.latitude;
					currentmsg.longitude = current.longitude;
		  		}
		  		if ((msg.track != null) && (current.track != msg.track)) {
		  			current.track= msg.track;
		  			currentmsg.track = current.track;	
		  		}
		  		if ((msg.callsign != null) && (current.callsign != msg.callsign)) {
		  			current.callsign = msg.callsign;
		  			currentmsg.callsign = current.callsign;
		  		}
		  		if ((msg.ground_speed != null) && (current.ground_speed != msg.ground_speed)) {
		  			current.ground_speed = Math.floor(msg.ground_speed * 1.8520); // km/h from knots
		  			currentmsg.ground_speed = current.ground_speed;
		  		}
		  		if ((msg.vertical_rate != null) && (current.vertical_rate != msg.vertical_rate)) {
		  			current.vertical_rate = Math.floor(msg.vertical_rate * 1.8520); // m/s from knots
		  			currentmsg.vertical_rate = current.vertical_rate;
		  		}
		  		if ((msg.squawk != null) && (current.squawk != msg.squawk)) {
		  			current.squawk = msg.squawk;
		  			currentmsg.squawk =current.squawk;
		  		}
		  		if ((msg.altitude != null) && (current.altitude != msg.altitude)) {
		  			current.altitude = Math.floor(msg.altitude * 0.3048); // feet en m
		  			currentmsg.altitude = current.altitude;
		  		}
		  		if ((msg.logged_time != null) && (current.logged_time != msg.logged_time)) {
		  			current.live_time = msg.logged_timestamp();
		  			currentmsg.live_time = current.live_time;
		  		}
		  		// Plane is back ?
		  		if (current.out_of_bound) {
					current.out_of_bound = false;		  			
		  			flight.emit('add', current);
		  		} else {
		  			flight.emit('change',currentmsg);
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



