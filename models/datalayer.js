var Sequelize = require("sequelize");

var DataAccessLayer = function() {
};

DataAccessLayer.prototype = {
	connect : function() {
		// Or you can simply use a connection uri
		this.db = new Sequelize('adsb_radar','radar','radar', {
			host: 'localhost',
			dialect: 'sqlite',
			storage : 'database/adsb-radar.sqlite'
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
			FlightId : { type : Sequelize.STRING, allownull : false, autoIncrement: true},			
			AircraftId  : { type : Sequelize.INTEGER, allownull : true},
			FlightName : { type : Sequelize.STRING, allownull : true, primaryKey: true},						
			Operator : { type : Sequelize.STRING, allownull : true},
			LastSeen : { type : Sequelize.DATE, allownull : true, defaultValue: Sequelize.NOW }
		}, {
			tableName : 'Flight',
			freezeTableName: true,
			timestamps : false
		});
		this.Aircraft = this.db.define('Aircraft', {
			AircraftId  : { type : Sequelize.INTEGER, allownull : false, autoIncrement: true},
			ModeS : { type : Sequelize.STRING, allownull : false, primaryKey: true},			
			Registration : { type : Sequelize.STRING, allownull : true},
			CodeType : { type : Sequelize.STRING, allownull : true},
			Manufacturer : { type : Sequelize.STRING, allownull : true},
			ModelType  : { type : Sequelize.STRING, allownull : true},
			Engines  : { type : Sequelize.STRING, allownull : true},
			DesignatorType  : { type : Sequelize.STRING, allownull : true},
			BaseTown  : { type : Sequelize.STRING, allownull : true}
		}, {
			tableName : 'Aircraft',
			freezeTableName: true,
			timestamps : false
		});
		this.Route = this.db.define('Route', {
			RouteId : { type : Sequelize.INTEGER, allownull : false, autoIncrement: true, primaryKey: true},
			AircraftId : { type : Sequelize.INTEGER, allownull : false},
			FlightId  : { type : Sequelize.INTEGER, allownull : false},
			DepartureId  : { type : Sequelize.STRING, allownull : false},
			ArrivalId  : { type : Sequelize.STRING, allownull : false}			
		}, {
			tableName : 'Route',
			freezeTableName: true,
			timestamps : false
		});
		this.Airport = this.db.define('Airport', {
			AirportId : { type : Sequelize.INTEGER, allownull : false, autoIncrement: true},
			Code : { type : Sequelize.STRING, allownull : false, primaryKey: true},
			Town : { type : Sequelize.STRING, allownull : false},
			Country  : { type : Sequelize.STRING, allownull : true},			
			AirportName  : { type : Sequelize.STRING, allownull : true},			
			Latitude  : { type : Sequelize.FLOAT, allownull : true},			
			Longitude : { type : Sequelize.FLOAT, allownull : true},
			AirportShort : { type : Sequelize.STRING, allownull : true},
			AirportCode : { type : Sequelize.STRING, allownull : true} 
		}, {
			tableName : 'Airport',
			freezeTableName: true,
			timestamps : false
		});
		// Relation define Flight and aircraft
		this.Flight.hasOne(this.Aircraft);
		this.Aircraft.belongsTo(this.Flight);
		// A Flight can have a route
		this.Route.hasMany(this.Flight);
		this.Flight.belongsTo(this.Flight);
		// An aircraft can have many route
		this.Route.hasMany(this.Aircraft);
		this.Aircraft.belongsTo(this.Route);
		// One route as one airport departure and one airport arrival
		this.Route.hasOne(this.Airport);
		this.Airport.belongsTo(this.Route);

	},
	getAircraft : function(res, start, limit) {
		this.Aircraft.find({ include : [ this.Flight ]}).then(function(batches) { // Not supported on SQL Server 2008 , offset : start, limit : limit
			res.json(batches);		
		}).done();
	},
	AddAircraft : function(data) {
		this.Aircraft.create( { ModeS : data.ICAO, Registration : data.Registration});
	}
}

module.exports = DataAccessLayer;

