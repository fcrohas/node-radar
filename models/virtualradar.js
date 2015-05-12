var config = require('config-node');
var http = require('http');
var zlib = require('zlib');
var url = require('url');
var events = require('events');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

function VirtualRadar() {
	events.EventEmitter.call(this);
	this.url = 'http://'+config.SBS.baseUrl+config.SBS.url;
	this.faa = 0;
	this.decoder = new StringDecoder('utf8');
	this.body = null;
	this.chunks = [];
	this.encoding = '';
}

// inherit event class
util.inherits(VirtualRadar, events.EventEmitter);


VirtualRadar.prototype.getPlanes = function() {
		var query = (this.url);
		var options = '';
		this.body = null;
		if (config.Proxy.enable)
		{
			options = {
				host: config.Proxy.host,
				port: config.Proxy.port,
				// hostname : config.SBS.baseUrl,
				path: config.SBS.url,
				headers: {
					Host: config.SBS.baseUrl,
					'Accept-Encoding' : 'gzip',
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

VirtualRadar.prototype._handleResponse = function(res) {
	this.chunks = [];
	this.encoding = res.headers['content-encoding'];
	if (this.encoding == 'gzip') {
		var gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', this._handleResponseData.bind(this))
        	  .on('end', this._handleResponseEnd.bind(this))
        	  .on('error', this._emitError.bind(this));
	}  else {
		res.on('data', this._handleResponseData.bind(this));
		res.on('end', this._handleResponseEnd.bind(this));
		res.on('error', this._emitError.bind(this));
	}
};

VirtualRadar.prototype._handleResponseData = function(chunk) {
	this.chunks.push(chunk.toString());
};

VirtualRadar.prototype._handleResponseEnd = function() {
    this._ProcessBody(null, this.chunks.join(""));
}

VirtualRadar.prototype._ProcessBody = function(err,data) {
	var body = '';
	try {
	    body = JSON.parse(data);
	} catch(e) {
		console.log('Parse error : ' + e.message);
		body = '';
	}
	body = body.acList;
	for (var id in body) {
		this.emit('message', {message_type : "MSG",hex_ident : body[id].Icao, squawk : body[id].Sqk,
							callsign: body[id].Call, lat: ((body[id].Lat=="")? null : body[id].Lat), lon: ((body[id].Long=="")?null : body[id].Long),
							altitude:body[id].Alt,	vertical_rate:body[id].Vsi,
							track : body[id].Trak,	ground_speed:body[id].Spd, logged_time : Date.now(),
							logged_timestamp: function() { return Date.now();}
						});
	}
	this.body = '';
};

VirtualRadar.prototype._emitError = function(err) {
	console.log(err);
	this.emit('message', '');
	this.emit('error', err);
};

module.exports = VirtualRadar;
