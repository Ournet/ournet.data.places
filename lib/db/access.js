'use strict';

var core = require('ournet.core');
var Promise = core.Promise;
var _ = core._;
var models = require('./models');
var util = require('../util.js');
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
	return models.GeoPlace.getAsync(parseInt(params.id)).then(function(place) {
		if (!place) {
			return place;
		}
		place = internal.get(place);
		return internal.getPlaceRegon(self, place, params.getRegion);
	});
};

/**
 * GeoPlace get items by ids
 */
Service.prototype.getPlaces = function(params) {
	var self = this;
	return models.GeoPlace.getItemsAsync(params.ids).then(function(places) {
		places = internal.get(places);
		if (params.getRegion && places) {
			return core.Promise.map(places, function(place) {
				if (place.region || place.feature_class !== 'P') {
					return place;
				}
				return self.getRegionByAdmin1({
					country_code: place.country_code,
					admin1_code: place.admin1_code
				}).then(function(region) {
					place.region = region;
					return place;
				});
			}).then(function(finalPlaces) {
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
	return new Promise(function(resolve, reject) {
		models.GeoPlace
			.query(params.key)
			.usingIndex('GeoPlacesAdm1Index')
			.limit(params.limit || 10)
			.select('ALL_PROJECTED_ATTRIBUTES')
			//.startKey(params.startKey.hashKey, params.startKey.rangeKey)
			.descending()
			.exec(function(error, data) {
				if (error) {
					return reject(error);
				}
				resolve(internal.get(data));
			});
	});
};

/**
 * GeoRegion get item by country_code & id
 */
Service.prototype.getRegion = function(params) {
	return models.GeoRegion.getAsync(params.country_code, parseInt(params.id)).then(internal.get);
};

/**
 * GeoRegion get item by country_code & admin1_code
 */
Service.prototype.getRegionByAdmin1 = function(params) {
	return new Promise(function(resolve, reject) {
		models.GeoRegion
			.query(params.country_code)
			.usingIndex('GeoAdmin1CodeIndex')
			.where('admin1_code')
			.equals(params.admin1_code)
			.limit(1)
			.exec(function(error, data) {
				if (error) {
					return reject(error);
				}
				resolve(internal.getFirst(data));
			});
	});
};

/**
 * GeoRegion get item by country_code
 */
Service.prototype.queryRegions = function(params) {
	return new Promise(function(resolve, reject) {
		models.GeoRegion
			.query(params.key)
			//.where('id')
			//.gt(0)
			.limit(params.limit || 50)
			.exec(function(error, result) {
				if (error) {
					return reject(error);
				}
				result = internal.get(result);
				resolve(result && result.Items || null);
			});
	});
};

/**
 * GeoOldId get item by id
 */
Service.prototype.getOldId = function(id) {
	return models.GeoOldId.getAsync(parseInt(id)).then(internal.get);
};

Service.makePlace = function(place) {
	place.getName = internal.getNameFn;
};

internal.get = function(data) {
	if (_.isNull(data) || _.isUndefined(data)) {
		return data;
	}
	if (_.isArray(data)) {
		return data.map(internal.get);
	}
	if (_.isFunction(data.toJSON)) {
		data = data.toJSON();
		if (data.alternatenames || (data.id && data.name)) {
			Service.makePlace(data);
		}
		return data;
	}
	if (_.isObject(data)) {
		Object.keys(data).forEach(function(key) {
			data[key] = internal.get(data[key]);
		});
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
				return Promise.resolve(place);
			});
	}
	return Promise.resolve(place);
};

internal.sortPlaces = function(places, sort) {
	if (sort) {
		return util.sortPlaces(places);
	}
	return places;
};

internal.getFirst = function(data) {
	data = internal.get(data);
	if (data && _.isArray(data.Items) && data.Items.length > 0) {
		return data.Items[0];
	}
	return null;
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
