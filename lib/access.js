'use strict';

require('./db/models');

var utils = require('./utils');
var Promise = utils.Promise;
var db = require('vogels-helpers');
var Place = require('./place');

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

function sortPlaces(places, sort) {
	if (sort) {
		return utils.sortPlaces(places);
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
		case 'placesByTypeKey':
			options = utils.formatAccessOptions(options, { format: 'items', limit: 10, sort: 'descending' });
			options.index = 'GeoPlacesTypeIndex';
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
						return sortPlaces(finalPlaces, options.sort);
					});
			}
			return sortPlaces(places, options.sort);
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
Service.prototype.placesByTypeKey = function(key, options) {
	options = this.formatAccessOptions('placesByTypeKey', options);
	options.key = key;

	return db.access.query('GeoPlace', options);
};

/**
 * Get adm1 by country_code & admin1_code
 */
Service.prototype.adm1 = function(key) {
	return this.placesByTypeKey(Place.formatTypeKey(key.country_code, 'adm1'), {
		limit: 100,
		format: 'first',
		filterExpression: '#adm1=:adm1',
		expressionAttributeNames: { '#adm1': 'admin1_code' },
		expressionAttributeValues: { ':adm1': key.admin1_code }
	});
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
 */
Service.prototype.queryRegions = function(params) {
	return db.access.query('GeoRegion', {
		key: params.key,
		limit: params.limit || 50,
		format: 'items'
	});
};
