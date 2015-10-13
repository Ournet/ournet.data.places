'use strict';

var core = require('ournet.core');
var _ = core._;
var models = require('./models');
var internal = {};

var Service = module.exports = function() {

};

Service.instance = new Service();

/**
 * GeoPlace put item
 */
Service.prototype.putPlace = function(data) {
	return models.GeoPlace.createAsync(data).then(internal.get);
};

/**
 * GeoPlace delete item
 */
Service.prototype.deletePlace = function(id) {
	return models.GeoPlace.destroyAsync(id).then(internal.get);
};

/**
 * GeoPlace update item
 */
Service.prototype.updatePlace = function(data) {
	return models.GeoPlace.updateAsync(data).then(internal.get);
};

/**
 * GeoRegion put item
 */
Service.prototype.putRegion = function(data) {
	return models.GeoRegion.createAsync(data).then(internal.get);
};

/**
 * GeoRegion put item
 */
Service.prototype.deleteRegion = function(country_code, id) {
	return models.GeoRegion.destroyAsync(country_code, id).then(internal.get);
};

/**
 * GeoRegion update item
 */
Service.prototype.updateRegion = function(data) {
	return models.GeoRegion.updateAsync(data).then(internal.get);
};

/**
 * GeoOldId put item
 */
Service.prototype.putOldId = function(data) {
	return models.GeoOldId.createAsync(data).then(internal.get);
};

/**
 * GeoAltName delete item
 */
Service.prototype.deleteAltName = function(geonameid, id) {
	return models.GeoAltName.destroyAsync(geonameid, id).then(internal.get);
};

/**
 * GeoAltName put item
 */
Service.prototype.putAltName = function(data) {
	return models.GeoAltName.createAsync(data).then(internal.get);
};

/**
 * GeoOldId delete item
 */
Service.prototype.deleteOldId = function(id) {
	return models.GeoOldId.destroyAsync(id).then(internal.get);
};

internal.get = function(data) {
	if (_.isNull(data) || _.isUndefined(data)) {
		return data;
	}
	if (_.isArray(data)) {
		return data.map(internal.get);
	}
	if (_.isFunction(data.toJSON)) {
		return data.toJSON();
	}
	return data;
};
