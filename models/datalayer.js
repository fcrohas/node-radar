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
			omitNull: true
		});		
		this.db.authenticate().complete(function(err) {
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
		// Relation define Flight and aircraft
		this.Aircraft.hasMany(this.Flight, {foreignKey : 'AircraftId'});
		// An aircraft can have many route
		this.Route.hasOne(this.Flight, {as: 'Flight', foreignKey : 'FlightId'});
		// One route as one airport departure and one airport arrival
		this.Airport.hasOne(this.Route, {as: 'Departure', foreignKey : 'DepartureId'});
		this.Airport.hasOne(this.Route, {as: 'Arrival', foreignKey : 'ArrivalId'});


	},
	getAircraft : function(adsb) {
		return this.Aircraft.findAndCount({ where:{ ModeS : adsb}});
	},
	searchAircraft : function(search) {
		return this.Aircraft.findAndCount({ include : this.Flight, where:{ Registration : {like : search+'%'}}});
	},
	addAircraft : function(data) {
		var db = this;
		this.Aircraft.create( data ).complete(function(err, aircraft) {
			if (err != null) {
				console.log('Error aircraft:'+err);
				return;
			}
			var options = {};			
			data.AircraftId = aircraft.AircraftId;
			options.defaults = data;
			options.where = {FlightName : data.FlightName};
			db.Flight.findOrCreate( options ).complete(function(err, flightData) {
				if (err != null) {
					console.log('Error flight :'+err);
					return;
				}
				var flight = flightData[0].FlightId;
				if (data.Airport != undefined) {
					// Find if exist or create it
					options.defaults = data.Airport.departure;
					options.where = { AirportCode : data.Airport.departure.AirportCode};
					db.Airport.findOrCreate( options).complete(function(err, airport) {
							if (err != null) {
								console.log('Error airport :'+err);
								return;
							}
							var departure = airport[0].AirportId;
							options.defaults = data.Airport.arrival;
							options.where = { AirportCode : data.Airport.arrival.AirportCode};
							db.Airport.findOrCreate( options).complete(function(err, airport) {
								var arrival = airport[0].AirportId;
								if (err != null) {
									console.log('Error airport :'+err);
									return;
								}
								options.defaults = {FlightId : flight, DepartureId : departure, ArrivalId : arrival};
								options.where = {FlightId : flight};
								db.Route.findOrCreate( options ).complete(function(err, airport) {
									if (err != null) {
										console.log('Error route :'+err);
										return;
									}
								});
						});
					});
				}				
			});
		});
	}
}

module.exports = DataAccessLayer;

