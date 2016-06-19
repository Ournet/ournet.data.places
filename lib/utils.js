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

exports.filterNames = function(names, langs) {
	if (!_.isString(names) || names.length < 1) {
		return null;
	}
	if (_.isString(langs)) {
		langs = [langs];
	}
	var data = names.split(';'),
		list = [];
	data.forEach(function(item) {
		var lang = item.substr(item.length - 3, 2);
		if (langs.indexOf(lang) > -1) {
			list.push(item);
		}
	});
	if (list.length === 0) {
		return null;
	}
	return list.join(';');
};

exports.formatAccessOptions = function(options, defaults) {
	return _.defaults({}, options || {}, defaults || {}, { format: 'json' });
};

module.exports = exports = _.assign({
	_: _,
	Promise: Promise
}, exports);
