'use strict';

var core = require('ournet.core');
var _ = core._;
var Promise = core.Promise;
var cache = new core.MemoryCache();
var AccessService = require('./access.js');

var Service = module.exports = function() {
	AccessService.call(this);
};

Service.prototype = new AccessService();

Service.instance = new Service();

Service.prototype.getRegionByAdmin1 = function(params, options) {
	var key = ['region', params.country_code, params.admin1_code].join('-'),
		result = cache.get(key);

	if (result) {
		return Promise.resolve(result);
	}

	var defaults = {
		ttl: 60 * 1,
		cache: true
	};

	options = options && _.defaults(options, defaults) || defaults;

	return AccessService.prototype.getRegionByAdmin1.call(this, params).then(function(resultWithAdm) {
		if (resultWithAdm && options.cache) {
			cache.set(key, resultWithAdm, options.ttl);
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

	return AccessService.prototype.getPlaces.call(this, params).then(function(resultPlaces) {
		if (resultPlaces && options.cache) {
			cache.set(key, resultPlaces, options.ttl);
		}
		return resultPlaces;
	});
};
