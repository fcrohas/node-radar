var config = require('config-node');
var http = require('http');
var url = require('url');
var events = require('events');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

function PlaneFinder() {
	events.EventEmitter.call(this);
	this.url = 'http://planefinder.net/endpoints/planeData.php?';
	this.faa = 0;
	this.decoder = new StringDecoder('utf8');
	this.body = '';
}

// inherit event class
util.inherits(PlaneFinder, events.EventEmitter);


PlaneFinder.prototype.getPlaneInfo = function(ICAO, flightno, timestamp) {
		var query = (this.url
					+ 'adshex=' + ICAO 
					+ '&flightno=' + flightno.trim() 
					+ '&ts=' + Math.floor(timestamp / 1000)
					+ '&isFAA=' + (this.faa ? '1' : '0') 
					+ '&_=' + Date.now());
		var options = '';
		if (config.Proxy.enable)
		{
			options = {
				host: config.Proxy.host,
				port: config.Proxy.port,
				path: query,
				headers: {
					Host: "planefinder.net",
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

PlaneFinder.prototype._handleResponse = function(res) {
	res.setEncoding('utf8');
	res.on('data', this._handleResponseData.bind(this));
	res.on('end', this._handleResponseEnd.bind(this));
	res.on('error', this._emitError.bind(this));
};

PlaneFinder.prototype._handleResponseData = function(chunk) {
	this.body += chunk;
};

PlaneFinder.prototype._handleResponseEnd = function() {
	var body = '';
	try {
		body = JSON.parse(this.body);
		this.emit('data', body);		
	} catch(e) {
		console.log('Parse error' + e.message);
		this.emit('data', '');		
	}
	this.emit('data', body);
	this.body = '';	
};

PlaneFinder.prototype._emitError = function(err) {
	console.log(err);
	this.emit('data', '');
	this.emit('error', err);
};

module.exports = PlaneFinder;

