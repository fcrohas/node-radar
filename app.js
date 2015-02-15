// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');

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

// listen to socket.io connection
flight.on('connection', function(socket) {
	console.log('User connected');
	client.on('message', function(msg) {
	  if (msg.message_type === sbs1.MessageType.TRANSMISSION /*&&
		msg.transmission_type === sbs1.TransmissionType.ES_AIRBORNE_POS*/) {
	  	var current = planes['ICAO'+msg.hex_ident];
	  	if (current!=undefined) {
	  		if ((current.longitude != msg.lon) || (current.latitude != msg.lat)) {
				planes['ICAO'+msg.hex_ident].latitude = msg.lat;
				planes['ICAO'+msg.hex_ident].longitude = msg.lon;
				socket.volatile.send(planes['ICAO'+msg.hex_ident]);				
	  		}
	  		if ((msg.track != null) && (current.track != msg.track)) {
	  			planes['ICAO'+msg.hex_ident].track= msg.track;	
				socket.volatile.send(planes['ICAO'+msg.hex_ident]);	  			
	  		}
	  		if ((msg.callsign != null) && (current.callsign != msg.callsign)) {
	  			planes['ICAO'+msg.hex_ident].callsign = msg.callsign;
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);	  			
	  		}
	  		if ((msg.ground_speed != null) && (current.ground_speed != msg.ground_speed)) {
	  			planes['ICAO'+msg.hex_ident].ground_speed = Math.floor(msg.ground_speed * 1.8520); // km/h from knots
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);	  			
	  		}
	  		if ((msg.vertical_rate != null) && (current.vertical_rate != msg.vertical_rate)) {
	  			planes['ICAO'+msg.hex_ident].vertical_rate = Math.floor(msg.vertical_rate * 1.8520); // m/s from knots
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);	  			
	  		}
	  		if ((msg.squawk != null) && (current.squawk != msg.squawk)) {
	  			planes['ICAO'+msg.hex_ident].squawk = msg.squawk;
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);	  			
	  		}
	  		if ((msg.altitude != null) && (current.altitude != msg.altitude)) {
	  			planes['ICAO'+msg.hex_ident].altitude = Math.floor(msg.altitude * 0.3048); // feet en m
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);
	  		}
	  		if ((msg.logged_time != null) && (current.logged_time != msg.logged_time)) {
	  			var msgTime = msg.logged_timestamp();
	  			//console.log(((msgTime - planes['ICAO'+msg.hex_ident].live_time) / 1000));
  				planes['ICAO'+msg.hex_ident].quality = ((msgTime - planes['ICAO'+msg.hex_ident].live_time) / 1000) < 4; // 30 s delay bad quality
	  			planes['ICAO'+msg.hex_ident].live_time = msgTime;
	  			socket.volatile.send(planes['ICAO'+msg.hex_ident]);
	  		}
		}
		else {
			planes['ICAO'+msg.hex_ident] = {'ICAO':msg.hex_ident,'latitude' : msg.lat, 'longitude' : msg.lon, 'title' : msg.ICAO, 'track': 90, 'callsign' : 'unknown', 'ground_speed':0, 'altitude' : 0, 'vertical_rate':0, 'squawk' : 0, 'out_of_bound' : false, 'live_time': msg.logged_timestamp(), 'quality':true};
			socket.volatile.send(planes['ICAO'+msg.hex_ident]);			
		}
	  }
	});
});


