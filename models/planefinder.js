var http = require('http');
var url = require('url');

var PlaneFinder = function() {
	this.url = 'http://planefinder.net/endpoints/planeData.php?';
	this.faa = 0;
}

PlaneFinder.prototype = {
	getPlaneInfo : function(ICAO, flightno, timestamp) {
		var query = (this.url
					+ 'adshex=' + ICAO 
					+ '&flightno=' + flightno.trim() 
					+ '&ts=' + Math.floor(timestamp / 1000)
					+ '&isFAA=' + (this.faa ? '1' : '0') 
					+ '&_=' + Date.now());
		console.log(query);
		var options = url.parse(query);
		options.headers = {
		'X-Requested-With': 'XMLHttpRequest'
		};
		var req = http.get(options, this._handleResponse.bind(this));		

	},
	_handleResponse : function(res) {
	   console.log('icicicicici');
	  res.on('data', this._handleResponseData.bind(this));
	  res.on('end', this._handleResponseEnd.bind(this));
	  res.on('error', this._emitError.bind(this));
	},
	_handleResponseData : function(chunk) {
		console.log(chunk);
	  this.body += chunk;
	},
	_handleResponseEnd : function() {
	  this.emit('data', this.body);
	},
	_emitError : function(err) {
	  console.log(err);
	  this.emit('error', err);
	}
}

module.exports = PlaneFinder;