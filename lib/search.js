'use strict';

var elasticsearch = require('elasticsearch');
var core = require('ournet.core');
var PlacesAccessService = require('./db/access.js');
var internal = {};


var Service = module.exports = function(host) {
	this.client = new elasticsearch.Client({
		host: host || process.env.ES_HOST
	});

	this.client.searchAsync = core.Promise.promisify(this.client.search);
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
	//console.log(response[0].hits.hits);
	if (response[0].hits && response[0].hits.total > 0) {
		response[0].hits.hits.forEach(function(item) {
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

			PlacesAccessService.makePlace(place);
			PlacesAccessService.makePlace(place.region);

			places.push(place);
		});
	}

	return places;
};
