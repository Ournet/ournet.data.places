'use strict';

var core = require('ournet.core');
var Promise = core.Promise;

var vogels = require('vogels');
var Joi = require('joi');
var models = module.exports;

models.GeoPlace = vogels.define('GeoPlace', {
	tableName: 'GeoPlaces',
	hashKey: 'id',
	schema: {
		id: Joi.number().integer().required(),
		name: Joi.string().max(200).required(),
		asciiname: Joi.string().max(200).required(),
		alternatenames: Joi.string(),
		latitude: Joi.number().precision(5),
		longitude: Joi.number().precision(5),
		feature_class: Joi.string().length(1).required(),
		feature_code: Joi.string().max(10).required(),
		country_code: Joi.string().length(2).required(),
		admin1_code: Joi.string().max(20).required(),
		admin2_code: Joi.string().max(80).allow(''),
		admin3_code: Joi.string().max(20).allow(''),
		population: Joi.number().integer(),
		elevation: Joi.number().integer(),
		dem: Joi.number().integer(),
		timezone: Joi.string().max(200).allow(''),
		modification_date: Joi.date(),
		adm1_key: Joi.string().max(23).required()
	},
	indexes: [{
		hashKey: 'adm1_key',
		rangeKey: 'population',
		type: 'global',
		name: 'GeoPlacesAdm1Index',
		projection: {
			id: 'id',
			adm1_key: 'adm1_key',
			population: 'population',
			name: 'name',
			alternatenames: 'alternatenames',
			asciiname: 'asciiname'
		}
	}]
});

models.GeoRegion = vogels.define('GeoRegion', {
	tableName: 'GeoAdmin1',
	hashKey: 'country_code',
	rangeKey: 'id',
	schema: {
		id: Joi.number().integer().required(),
		name: Joi.string().max(200).required(),
		asciiname: Joi.string().max(200).required(),
		alternatenames: Joi.string(),
		latitude: Joi.number().precision(5),
		longitude: Joi.number().precision(5),
		feature_class: Joi.string().length(1).required(),
		feature_code: Joi.string().max(10).required(),
		country_code: Joi.string().length(2).required(),
		admin1_code: Joi.string().max(20).required(),
		admin2_code: Joi.string().max(80),
		admin3_code: Joi.string().max(20),
		population: Joi.number().integer(),
		elevation: Joi.number().integer(),
		dem: Joi.number().integer(),
		timezone: Joi.string().max(200),
		modification_date: Joi.date()
	},
	indexes: [{
		hashKey: 'country_code',
		rangeKey: 'admin1_code',
		type: 'local',
		name: 'GeoAdmin1CodeIndex'
		//projection: 'ALL',
	}]
});

models.GeoOldId = vogels.define('GeoOldId', {
	tableName: 'GeoOldIds',
	hashKey: 'id',
	schema: {
		id: Joi.number().integer().required(),
		geonameid: Joi.number().integer().required()
	}
});

models.GeoAltName = vogels.define('GeoAltName', {
	tableName: 'GeoNames',
	hashKey: 'geonameid',
	rangeKey: 'id',
	schema: {
		id: Joi.number().integer().required(),
		geonameid: Joi.number().integer().required(),
		name: Joi.string().required(),
		isPreferred: Joi.boolean(),
		isShort: Joi.boolean(),
		isColloquial: Joi.boolean(),
		isHistoric: Joi.boolean()
	}
});

Promise.promisifyAll(models.GeoPlace);
Promise.promisifyAll(models.GeoRegion);
Promise.promisifyAll(models.GeoOldId);
Promise.promisifyAll(models.GeoAltName);
