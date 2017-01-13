'use strict';

require('./db/models');

var utils = require('./utils');
var Promise = utils.Promise;
var _ = utils._;
var db = require('vogels-helpers');

function getPlaceRegion(self, place, getRegion) {
	if (getRegion && place.feature_class === 'P') {
		return self.adm1({
				country_code: place.country_code,
				admin1_code: place.admin1_code
			})
			.then(function(region) {
				place.region = region;
				return place;
			});
	}
	return Promise.resolve(place);
}

function sortPlaces(places, ids) {
	if (places && places.length) {
		return ids.map(function(id) {
			return _.find(places, { id: id });
		});
	}
	return places;
}

/**
 * Access class
 */
var Service = module.exports = function() {

};

Service.instance = new Service();

Service.prototype.formatAccessOptions = function(name, options) {
	switch (name) {
		case 'placesByTypeAdm1':
			options = utils.formatAccessOptions(options, { format: 'items', limit: 10, sort: 'ascending' });
			options.index = 'GeoPlacesTypeAdm1Index';
			break;
		case 'placesByAdm1Key':
			options = utils.formatAccessOptions(options, { format: 'items', limit: 10, sort: 'descending' });
			options.index = 'GeoPlacesAdm1Index';
			break;
		default:
			options = utils.formatAccessOptions(options);
			break;
	}

	return options;
};

/**
 * GeoPlace get item by id
 */
Service.prototype.place = function(id, options) {
	var self = this;
	options = this.formatAccessOptions('place', options);

	return db.access.getItem('GeoPlace', id, options)
		.then(function(place) {
			if (!place) {
				return place;
			}
			return getPlaceRegion(self, place, options.getRegion);
		});
};

/**
 * GeoPlace get items by ids
 */
Service.prototype.places = function(ids, options) {
	var self = this;
	options = this.formatAccessOptions('places', options);

	return db.access.getItems('GeoPlace', ids, options)
		.then(function(places) {
			if (options.getRegion && places) {
				return Promise.map(places, function(place) {
						if (place.region || place.feature_class !== 'P') {
							return place;
						}
						return self.adm1({
								country_code: place.country_code,
								admin1_code: place.admin1_code
							})
							.then(function(region) {
								place.region = region;
								return place;
							});
					})
					.then(function(finalPlaces) {
						return sortPlaces(finalPlaces, ids, options.sort);
					});
			}
			return sortPlaces(places, ids, options.sort);
		});
};

/**
 * GeoPlace query by adm1_key
 */
Service.prototype.placesByAdm1Key = function(key, options) {
	options = this.formatAccessOptions('placesByAdm1Key', options);
	options.key = key;

	return db.access.query('GeoPlace', options);
};

/**
 * GeoPlace query by type_key
 */
Service.prototype.placesByTypeAdm1 = function(key, options) {
	options = this.formatAccessOptions('placesByTypeAdm1', options);
	options.key = key;

	return db.access.query('GeoPlace', options);
};

/**
 * Get adm1 by country_code & admin1_code
 */
Service.prototype.adm1 = function(key, options) {
	options = utils._.defaults({
		limit: 1,
		format: 'first',
		rangeKey: { name: 'admin1_code', value: key.admin1_code, operation: 'eq' }
	}, options || {});

	return this.placesByTypeAdm1(key.country_code, options);
};

/**
 * GeoOldId get item by id
 */
Service.prototype.oldId = function(id, options) {
	options = this.formatAccessOptions('oldId', options);

	return db.access.getItem('GeoOldId', id, options);
};

/**
 * GeoRegion get item by country_code
 * @deprecated
 */
Service.prototype.queryRegions = function(params) {
	return db.access.query('GeoRegion', {
		key: params.key,
		limit: params.limit || 50,
		format: 'items'
	});
};
