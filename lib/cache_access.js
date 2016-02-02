'use strict';

var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var cache = require('memory-cache');
var AccessService = require('./access');

var Service = module.exports = function() {
	AccessService.call(this);
};

Service.prototype = new AccessService();

Service.instance = new Service();

Service.prototype.getRegionByAdmin1 = function(params, options) {
	var key = ['region', params.country_code, params.admin1_code].join('-');
	var result = cache.get(key);

	if (result) {
		return Promise.resolve(result);
	}

	var defaults = {
		ttl: 60 * 1,
		cache: true
	};

	options = options && _.defaults(options, defaults) || defaults;

	return AccessService.prototype.getRegionByAdmin1.call(this, params)
		.then(function(resultWithAdm) {
			if (resultWithAdm && options.cache) {
				cache.put(key, resultWithAdm, options.ttl * 1000);
			}
			return resultWithAdm;
		});
};

Service.prototype.getPlaces = function(params, options) {
	var key = ['places', JSON.stringify(params.ids), params.getRegion].join('-');
	var result = cache.get(key);
	if (result) {
		return Promise.resolve(result);
	}

	var defaults = {
		ttl: 60,
		cache: true
	};

	options = options && _.defaults(options, defaults) || defaults;

	return AccessService.prototype.getPlaces.call(this, params)
		.then(function(resultPlaces) {
			if (resultPlaces && options.cache) {
				cache.put(key, resultPlaces, options.ttl * 1000);
			}
			return resultPlaces;
		});
};
