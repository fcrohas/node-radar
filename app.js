// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var io = require('socket.io');
var sbs1 = require('sbs1');

// Connect to ads-b server
var client = sbs1.createClient();

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
		}
		else {
			planes['ICAO'+msg.hex_ident] = {'ICAO':msg.hex_ident,'latitude' : msg.lat, 'longitude' : msg.lon, 'title' : msg.ICAO, 'track': 90};
			socket.volatile.send(planes['ICAO'+msg.hex_ident]);			
		}
	  }
	});
});


