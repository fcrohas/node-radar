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
		var username = 'fcr';
		var password = 'souris2lola*';
		var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
		var options_proxy = {
			host: "10.1.100.150",
			port: 3128,
			path: query,
			headers: {
				Host: "planefinder.net",
				'X-Requested-With': 'XMLHttpRequest',
				Authorization: auth
			}			
		};
		var req = http.get(/*options_proxy*/url.parse(query), this._handleResponse.bind(this));		
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
	try {
		this.emit('data', JSON.parse(this.body));
		this.body = '';
	} catch(e) {
		console.log(e.message+' with body '+this.body);
	}
};

PlaneFinder.prototype._emitError = function(err) {
	this.emit('error', err);
};

module.exports = PlaneFinder;

