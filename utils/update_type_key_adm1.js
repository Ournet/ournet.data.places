'use strict';

require('dotenv').load();

var utils = require('../lib/utils');
var Promise = utils.Promise;
var _ = utils._;
var access = require('../lib').AccessService.instance;
var control = require('../lib').ControlService.instance;

var COUNTRIES = (process.env.COUNTRIES || '').split(/[,;]/g);

function start() {
	return Promise.each(COUNTRIES, function(country) {
		return access.queryRegions({ key: country, limit: 500 })
			.then(function(regions) {
				console.log('got %s regions for %s', regions.length, country);
				return Promise.each(regions, function(region) {
						var data = _.pick(region, 'id', 'country_code', 'feature_code', 'admin1_code');
						console.log('updating region %s', region.name);
						return control.updatePlace(data)
							.then(function(result) {
								console.log('updated region %s', region.name, result.type_key);
								return Promise.delay(1000 * 1);
							});
					})
					.then(function() {
						console.log('updated all regions for %s', country);
						return Promise.delay(1000 * 10);
					});
			});
	});
}

start();
