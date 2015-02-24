var config = require('config-node');
var http = require('http');
var url = require('url');
var events = require('events');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

function Dump1090() {
	events.EventEmitter.call(this);
	this.url = 'http://88.173.195.21:8080/dump1090/data.json';
	this.faa = 0;
	this.decoder = new StringDecoder('utf8');
	this.body = '';
}

// inherit event class
util.inherits(Dump1090, events.EventEmitter);


Dump1090.prototype.getPlanes = function() {
		var query = (this.url);
		var options = '';
		if (config.Proxy.enable)
		{
			options = {
				host: config.Proxy.host,
				port: config.Proxy.port,
				path: query,
				headers: {
					Host: "88.173.195.21",
					'X-Requested-With': 'XMLHttpRequest'
				}
			};
			if (config.Proxy.BasicAuth.enable) {
				var auth = 'Basic ' + new Buffer(config.Proxy.BasicAuth.login + ':' + config.Proxy.BasicAuth.password).toString('base64');
				options.headers.Authorization = auth;
			}
		} else {
			options = url.parse(query);
		}
		var req = http.get(options, this._handleResponse.bind(this));		
		req.on('error', this._emitError.bind(this));
		req.end();
		return this;
};

Dump1090.prototype._handleResponse = function(res) {
	res.setEncoding('utf8');
	res.on('data', this._handleResponseData.bind(this));
	res.on('end', this._handleResponseEnd.bind(this));
	res.on('error', this._emitError.bind(this));
};

Dump1090.prototype._handleResponseData = function(chunk) {
	this.body += chunk;
};

Dump1090.prototype._handleResponseEnd = function() {
	var body = '';
	try {
		body = JSON.parse(this.body);
	} catch(e) {
		console.log('Parse error' + e.message);
		body = '';		
	}
	for (var id in body) {
		this.emit('message', {message_type : "MSG",hex_ident : body[id].hex, squawk : body[id].squawk, 
							callsign: body[id].flight, lat: ((body[id].lat=="")? null : body[id].lat), lon: ((body[id].lon=="")?null : body[id].lon),
							altitude:body[id].altitude,	vertical_rate:body[id].vert_rate, 
							track : body[id].track,	ground_speed:body[id].speed, logged_time : Date.now(),
							logged_timestamp: function() { return Date.now();}
						});	
	}	
	this.body = '';	
};

Dump1090.prototype._emitError = function(err) {
	this.emit('message', '');
	this.emit('error', err);
};

module.exports = Dump1090;

