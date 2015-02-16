// set variables for environment
var express = require('express');
var events = require('events');
var app = express();
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');
var planefinder = require('./models/planefinder');

var plane = new planefinder();
// Connect to ads-b server
var options = { host: '192.168.1.22', port:'30003'};
var client = sbs1.createClient(options);

// Set server port
var server = app.listen(3000);

var websocket = io.listen(server);
websocket.set('destroy upgrade',false);
var planes = [];
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
	plane.getPlaneInfo(adsb, planes['ICAO'+adsb].callsign,Date.now()).once('data', function(data) {
		res.json(data);
		res.end();
	});
});

// listen to socket.io connection
flight.on('connection', function(socket) {
	console.log('User connected');
	// Flight alert for out of bound
	var flightalert = setInterval( function() {
		// compute delta time
		var timeOffset = new Date().getTimezoneOffset() * 60; // get it in seconds
		var delta = (Date.now() / 1000) + timeOffset;
		//console.log("Delta time is "+delta+" with time zone "+timeOffset);
		// Check time delta for each plane
		for (var planeId in planes) {
			var current = planes[planeId];
			var seenDelta = Math.floor(delta - (current.live_time / 1000));
			//console.log("plane "+current.ICAO+" seen since "+seenDelta);
			if ((seenDelta > 60) && (!current.out_of_bound))  { // 1 minutes delta ?
				current.out_of_bound = true;
				socket.volatile.send(current);
			}
			// After outbound of 3 minutes delte it
			if (seenDelta > 180) {
				delete planes[planeId];
				console.log(planeId);
				planes.splice(planeId,1)
			}
		}
	}, 1000);	
	client.on('message', function(msg) {
	  if (msg.message_type === sbs1.MessageType.TRANSMISSION) {
	  	var current = planes['ICAO'+msg.hex_ident];
	  	if (current!=undefined) {
	  		if ((current.longitude != msg.lon) || (current.latitude != msg.lat)) {
				current.latitude = msg.lat;
				current.longitude = msg.lon;
	  		}
	  		if ((msg.track != null) && (current.track != msg.track)) {
	  			current.track= msg.track;	
	  		}
	  		if ((msg.callsign != null) && (current.callsign != msg.callsign)) {
	  			current.callsign = msg.callsign;
	  		}
	  		if ((msg.ground_speed != null) && (current.ground_speed != msg.ground_speed)) {
	  			current.ground_speed = Math.floor(msg.ground_speed * 1.8520); // km/h from knots
	  		}
	  		if ((msg.vertical_rate != null) && (current.vertical_rate != msg.vertical_rate)) {
	  			current.vertical_rate = Math.floor(msg.vertical_rate * 1.8520); // m/s from knots
	  		}
	  		if ((msg.squawk != null) && (current.squawk != msg.squawk)) {
	  			current.squawk = msg.squawk;
	  		}
	  		if ((msg.altitude != null) && (current.altitude != msg.altitude)) {
	  			current.altitude = Math.floor(msg.altitude * 0.3048); // feet en m
	  		}
	  		if ((msg.logged_time != null) && (current.logged_time != msg.logged_time)) {
	  			var msgTime = msg.logged_timestamp();
	  			//console.log(((msgTime - planes['ICAO'+msg.hex_ident].live_time) / 1000));
  				current.quality = ((msgTime - current.live_time) / 1000) < 4; // 30 s delay bad quality
	  			current.live_time = msgTime;
	  		}
  			socket.volatile.send(current);
		}
		else {
			planes['ICAO'+msg.hex_ident] = {'ICAO':msg.hex_ident,'latitude' : msg.lat, 'longitude' : msg.lon, 
											'title' : msg.ICAO, 'track': 0, 'callsign' : 'unknown', 'ground_speed':0, 
											'altitude' : 0, 'vertical_rate':0, 'squawk' : 0, 'out_of_bound' : false, 
											'live_time': msg.logged_timestamp(), 'quality':true};
			socket.volatile.send(planes['ICAO'+msg.hex_ident]);			
		}
	  }
	});
});


