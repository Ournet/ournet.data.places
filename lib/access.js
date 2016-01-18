'use strict';

require('./db/models');

var utils = require('./utils');
var Promise = utils.Promise;
var _ = utils._;
var db = require('vogels-helpers');
var internal = {};

/**
 * Access class
 */
var Service = module.exports = function() {

};

Service.instance = new Service();

/**
 * GeoPlace get item by id
 */
Service.prototype.getPlace = function(params) {
	var self = this;
	return db.access.getItem('GeoPlace', parseInt(params.id), {
			format: 'json'
		})
		.then(function(place) {
			if (!place) {
				return place;
			}
			internal.getPlace(place);
			return internal.getPlaceRegon(self, place, params.getRegion);
		});
};

/**
 * GeoPlace get items by ids
 */
Service.prototype.getPlaces = function(params) {
	var self = this;
	return db.access.getItems('GeoPlace', params.ids, {
			format: 'json'
		})
		.then(function(places) {
			internal.getPlace(places);
			if (params.getRegion && places) {
				return Promise.map(places, function(place) {
						if (place.region || place.feature_class !== 'P') {
							return place;
						}
						return self.getRegionByAdmin1({
								country_code: place.country_code,
								admin1_code: place.admin1_code
							})
							.then(function(region) {
								place.region = region;
								return place;
							});
					})
					.then(function(finalPlaces) {
						return internal.sortPlaces(finalPlaces, params.sort);
					});
			}
			return internal.sortPlaces(places, params.sort);
		});
};

/**
 * GeoPlace query by adm1_key
 */
Service.prototype.queryPlacesByAdm1Key = function(params) {
	return db.access.query('GeoPlace', {
		key: params.key,
		limit: params.limit || 10,
		select: 'ALL_PROJECTED_ATTRIBUTES',
		index: 'GeoPlacesAdm1Index',
		sort: 'descending',
		format: 'items'
	}).then(internal.getPlace);
};

/**
 * GeoRegion get item by country_code & id
 */
Service.prototype.getRegion = function(params) {
	return db.access.getItem('GeoRegion', {
		country_code: params.country_code,
		id: parseInt(params.id)
	}, {
		format: 'json'
	}).then(internal.getPlace);
};

/**
 * GeoRegion get item by country_code & admin1_code
 */
Service.prototype.getRegionByAdmin1 = function(params) {
	return db.access.query('GeoRegion', {
		key: params.country_code,
		limit: 1,
		rangeKey: {
			operation: 'equals',
			value: params.admin1_code,
			name: 'admin1_code'
		},
		index: 'GeoAdmin1CodeIndex',
		sort: 'descending',
		format: 'first'
	}).then(internal.getPlace);
};

/**
 * GeoRegion get item by country_code
 */
Service.prototype.queryRegions = function(params) {
	return db.access.query('GeoRegion', {
		key: params.key,
		limit: params.limit || 50,
		format: 'items'
	}).then(internal.getPlace);
};

/**
 * GeoOldId get item by id
 */
Service.prototype.getOldId = function(id) {
	return db.access.getItem('GeoOldId', parseInt(id), {
		format: 'json'
	});
};

Service.makePlace = function(place) {
	place.getName = internal.getNameFn;
};

internal.getPlace = function(data) {
	if (!data) {
		return data;
	}
	if (Array.isArray(data)) {
		return data.map(internal.getPlace);
	}
	if (data) {
		Service.makePlace(data);
	}

	return data;
};

internal.getPlaceRegon = function(self, place, getRegion) {
	if (getRegion && place.feature_class === 'P') {
		return self.getRegionByAdmin1({
				country_code: place.country_code,
				admin1_code: place.admin1_code
			})
			.then(function(region) {
				place.region = region;
				return place;
			});
	}
	return Promise.resolve(place);
};

internal.sortPlaces = function(places, sort) {
	if (sort) {
		return utils.sortPlaces(places);
	}
	return places;
};

internal.getNameFn = function(lang) {
	var key = 'name_' + lang;
	if (this[key]) {
		return this[key];
	}

	if (this.alternatenames) {
		var data = this.alternatenames.split(';');
		for (var i = data.length - 1; i >= 0; i--) {
			if (!data[i] || data[i].length < 5) {
				continue;
			}
			var name = data[i].substr(0, data[i].length - 4);
			if (name + '[' + lang + ']' === data[i]) {
				this[key] = name;
				return name;
			}
		}
	}
	return this.name;
};
