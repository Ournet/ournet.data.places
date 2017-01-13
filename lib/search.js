'use strict';

var elasticsearch = require('elasticsearch');
var utils = require('./utils');
var Promise = utils.Promise;
var internal = {};


var Service = module.exports = function(host) {
	this.client = new elasticsearch.Client({
		host: host || process.env.ES_HOST
	});

	this.client.searchAsync = Promise.promisify(this.client.search);
};

if (process.env.ES_HOST) {
	Service.instance = new Service();
}

Service.prototype.search = function(params) {
	return this.query(params);
};

Service.prototype.query = function(params) {

	var body = {
		'query': {
			'filtered': {
				'query': {
					'multi_match': {
						'query': params.query || params,
						'fields': ['name', 'asciiname', 'names', 'region.name', 'region.names']
					}
				}
			}
		}
	};

	if (params.size) {
		body.size = params.size;
	}

	if (params.country) {
		body.query.filtered.filter = {
			'term': {
				'country': params.country
			}
		};
	}

	return this.client.searchAsync({
		index: 'places',
		type: 'place',
		body: body
	}).then(internal.get);
};

Service.prototype.suggest = function(params) {

	var body = {
		'query': {
			'filtered': {
				'query': {
					'multi_match': {
						'query': params.query || params,
						'fields': ['name', 'asciiname', 'names'],
						'type': 'phrase_prefix'
					}
				}
			}
		}
	};

	if (params.size) {
		body.size = params.size;
	}

	if (params.country) {
		body.query.filtered.filter = {
			'term': {
				'country': params.country
			}
		};
	}

	return this.client.searchAsync({
		index: 'places',
		type: 'place',
		body: body
	}).then(internal.get);
};

internal.get = function(response) {
	var places = [];
	// console.log(response);
	if (response.hits && response.hits.total > 0) {
		response.hits.hits.forEach(function(item) {
			var place = {
				id: item._id,
				name: item._source.name,
				asciiname: item._source.asciiname,
				alternatenames: item._source.names,
				admin1_code: item._source.admin1_code,
				country_code: item._source.country,
				region: {
					name: item._source.region.name,
					asciiname: item._source.region.asciiname,
					alternatenames: item._source.region.names
				}
			};

			places.push(place);
		});
	}

	return places;
};
