'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

exports.sortPlaces = function(places) {
	if (!places) {
		return places;
	}
	return _.sortBy(places, 'name');
};

exports.startWithUpperCase = function(str) {
	if (!str || str.length < 1) {
		return str;
	}
	return str[0].toUpperCase() + str.substr(1);
};

exports.endsWith = function(target, end) {
	if (!target || !end || target.length < end.length) {
		return false;
	}
	return target.substr(target.length - end.length) === end;
};

module.exports = exports = _.assign({
	_: _,
	Promise: Promise
}, exports);
