var Sequelize = require("sequelize");

var DataAccessLayer = function() {
};

DataAccessLayer.prototype = {
	connect : function() {
		// Or you can simply use a connection uri
		this.db = new Sequelize('adsb_radar','radar','radar', {
			host: 'localhost',
			dialect: 'sqlite',
			storage : 'database/adsb-radar.sqlite',
			omitNull: true,
			logging: false //console.log
		});		
		this.db.authenticate().then(function(err) {
			if (!!err)
				console.log('Unable to connect to the database:', err);
			else
				console.log('Connection has been established successfully.')
		});
		this.initialize();
		this.db.sync();
	},
	initialize : function() {
		this.Flight = this.db.define('Flight', {
			FlightId : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true},			
			AircraftId  : { type : Sequelize.INTEGER, allownull : true},
			FlightName : { type : Sequelize.STRING, allownull : true},						
			Operator : { type : Sequelize.STRING, allownull : true},
			LastSeen : { type : Sequelize.DATE, allownull : true, defaultValue: Sequelize.NOW }
		}, {
			tableName : 'Flight',
			freezeTableName: false,
			timestamps : false
		});
		this.Aircraft = this.db.define('Aircraft', {
			AircraftId  : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
			ModeS : { type : Sequelize.STRING, allownull : false},			
			Registration : { type : Sequelize.STRING, allownull : true},
			CodeType : { type : Sequelize.STRING, allownull : true},
			Manufacturer : { type : Sequelize.STRING, allownull : true},
			ModelType  : { type : Sequelize.STRING, allownull : true},
			Engines  : { type : Sequelize.STRING, allownull : true},
			DesignatorType  : { type : Sequelize.STRING, allownull : true},
			BaseTown  : { type : Sequelize.STRING, allownull : true}
		}, {
			tableName : 'Aircraft',
			freezeTableName: false,
			timestamps : false
		});
		this.Route = this.db.define('Route', {
			RouteId : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
			FlightId  : { type : Sequelize.INTEGER, allownull : false},
			DepartureId  : { type : Sequelize.STRING, allownull : false},
			ArrivalId  : { type : Sequelize.STRING, allownull : false}			
		}, {
			tableName : 'Route',
			freezeTableName: false,
			timestamps : false
		});
		this.Airport = this.db.define('Airport', {
			AirportId : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
			Code : { type : Sequelize.STRING, allownull : false},
			Town : { type : Sequelize.STRING, allownull : false},
			Country  : { type : Sequelize.STRING, allownull : true},			
			AirportName  : { type : Sequelize.STRING, allownull : true},			
			Longitude : { type : Sequelize.FLOAT, allownull : true},
			Latitude  : { type : Sequelize.FLOAT, allownull : true},			
			AirportCode : { type : Sequelize.STRING, allownull : true} 
		}, {
			tableName : 'Airport',
			freezeTableName: false,
			timestamps : false
		});

		this.Coverage = this.db.define('Coverage', {
			DistanceId : { type : Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
			Longitude : { type : Sequelize.FLOAT, allownull : true},
			Latitude  : { type : Sequelize.FLOAT, allownull : true},			
			Altitude  : { type : Sequelize.FLOAT, allownull : true}			
		}, {
			tableName : 'Coverage',
			freezeTableName: false,
			timestamps : false

		});
		// Relation define Flight and aircraft
		this.Aircraft.hasMany(this.Flight, {foreignKey : 'AircraftId'});
		// An aircraft can have many route
		this.Route.hasOne(this.Flight, {as: 'Flight', foreignKey : 'FlightId'});
		// One route as one airport departure and one airport arrival
		this.Airport.hasOne(this.Route, {as: 'Departure', foreignKey : 'DepartureId'});
		this.Airport.hasOne(this.Route, {as: 'Arrival', foreignKey : 'ArrivalId'});


	},
	getAircraft : function(adsb) {
		return this.Aircraft.findAndCountAll({ where:{ ModeS : adsb}});
	},
	searchAircraft : function(search) {
		return this.Aircraft.findAndCountAll({ include : this.Flight, where:{ Registration : {like : search+'%'}}});
	},
	addAircraft : function(data) {
		var db = this;
		var flight = {};
		var departure = {};
		this.Aircraft.create( data )
		// register flight
		.then(function(aircraft) {
			var options = {};			
			data.AircraftId = aircraft.AircraftId;
			options.defaults = data;
			options.where = {FlightName : data.FlightName};
			return db.Flight.findOrCreate( options );
		// register departure
		}).then(function(flightData) {
			flight = flightData[0].FlightId;
			if (data.Airport != undefined) {
				var options = {};
				// Find if exist or create it
				options.defaults = data.Airport.departure;
				options.where = { AirportCode : data.Airport.departure.AirportCode};
				return db.Airport.findOrCreate( options);
			}
		// register arrival airport
		}).then(function(airport) {
			if (airport != undefined) {
				departure = airport[0].AirportId;
				var options = {};			
				options.defaults = data.Airport.arrival;
				options.where = { AirportCode : data.Airport.arrival.AirportCode};
			return db.Airport.findOrCreate( options);
			}
		// register routes
		}).then(function(airport) {
			if (airport != undefined) {
				var arrival = airport[0].AirportId;
				var options = {};
				options.defaults = {FlightId : flight, DepartureId : departure, ArrivalId : arrival};
				options.where = {FlightId : flight};
				return db.Route.findOrCreate( options );
			}
		});
	},
	addCoverage : function(data) {
		this.Coverage.create(data).then(function(result) {
			console.log('inserted');
		});
	},
	getCoverage : function() {
		return this.Coverage.findAndCountAll();
	},
	getAirports : function() {
		return this.Airport.findAndCountAll();
	}
};

module.exports = DataAccessLayer;

