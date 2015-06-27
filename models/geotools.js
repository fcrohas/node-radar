var GeoTools = function() {
};

GeoTools.prototype = {
	getDistanceFromLatLonInKm :function(lat1,lon1,lat2,lon2) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = this.radians(lat2-lat1);  // deg2rad below
	  var dLon = this.radians(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(this.radians(lat1)) * Math.cos(this.radians(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d;
	},
	// Make gradient color between two color
	makeGradientColor :function(color1, color2, percent) {
		var newColor = {};
		function makeChannel(a, b) {
		    return(a + Math.round((b-a)*(percent/100)));
		}
		function makeColorPiece(num) {
		    num = Math.min(num, 255);   // not more than 255
		    num = Math.max(num, 0);     // not less than 0
		    var str = num.toString(16);
		    if (str.length < 2) {
		        str = "0" + str;
		    }
		    return(str);
		}
		newColor.r = makeChannel(color1.r, color2.r);
		newColor.g = makeChannel(color1.g, color2.g);
		newColor.b = makeChannel(color1.b, color2.b);
		newColor.cssColor = "#" + 
		                    makeColorPiece(newColor.r) + 
		                    makeColorPiece(newColor.g) + 
		                    makeColorPiece(newColor.b);
		return(newColor);
	},
	radians :function(n) {
		return n * (Math.PI / 180);
	},
	degrees :function(n) {
		return n * (180 / Math.PI);
	},
	getBearing : function(startLat,startLong,endLat,endLong){
		startLat = this.radians(startLat);
		startLong = this.radians(startLong);
		endLat = this.radians(endLat);
		endLong = this.radians(endLong);

		var dLong = endLong - startLong;
		var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
		if (Math.abs(dLong) > Math.PI){
		  if (dLong > 0.0)
		     dLong = -(2.0 * Math.PI - dLong);
		  else
		     dLong = (2.0 * Math.PI + dLong);
		}

		return (this.degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
	}
};

module.exports = GeoTools;