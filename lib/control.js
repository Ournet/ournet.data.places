'use strict';

require('./db/models');

var db = require('vogels-helpers');

var Service = module.exports = function() {

};

Service.instance = new Service();

/**
 * GeoPlace put item
 */
Service.prototype.putPlace = function(data) {
	return db.control.put('GeoPlace', data, {
		format: 'json'
	});
};

/**
 * GeoPlace delete item
 */
Service.prototype.deletePlace = function(id) {
	return db.control.destroy('GeoPlace', id, {
		format: 'json'
	});
};

/**
 * GeoPlace update item
 */
Service.prototype.updatePlace = function(data) {
	return db.control.update('GeoPlace', data, {
		format: 'json'
	});
};

/**
 * GeoOldId put item
 */
Service.prototype.putOldId = function(data) {
	return db.control.put('GeoOldId', data, {
		format: 'json'
	});
};

/**
 * GeoAltName delete item
 */
Service.prototype.deleteAltName = function(geonameid, id) {
	return db.control.destroy('GeoAltName', {
		geonameid: geonameid,
		id: id
	}, {
		format: 'json'
	});
};

/**
 * GeoAltName put item
 */
Service.prototype.putAltName = function(data) {
	return db.control.put('GeoAltName', data, {
		format: 'json'
	});
};

/**
 * GeoOldId delete item
 */
Service.prototype.deleteOldId = function(id) {
	return db.control.destroy('GeoOldId', id, {
		format: 'json'
	});
};
