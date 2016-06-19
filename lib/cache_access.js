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

function getData(self, key, name, params, options, defaults) {
	var result = cache.get(key);

	if (result) {
		return Promise.resolve(result);
	}

	options = _.defaults({}, options || {}, defaults);

	return AccessService.prototype[name].call(self, params)
		.then(function(data) {
			if (data && options.ttl > 0) {
				cache.put(key, data, options.ttl * 1000);
			}
			return data;
		});
}

Service.prototype.getRegionByAdmin1 = function(params, options) {
	var key = ['region', params.country_code, params.admin1_code].join('-');

	var defaults = {
		ttl: 60 * 10
	};

	return getData(this, key, 'getRegionByAdmin1', params, options, defaults);
};

Service.prototype.getPlaces = function(params, options) {
	var key = ['places', JSON.stringify(params.ids), params.getRegion].join('-');

	var defaults = {
		ttl: 60 * 1
	};

	return getData(this, key, 'getPlaces', params, options, defaults);
};

Service.prototype.getPlace = function(params, options) {
	var key = ['place', params.id, params.getRegion].join('-');

	var defaults = {
		ttl: 60 * 1
	};

	return getData(this, key, 'getPlace', params, options, defaults);
};
