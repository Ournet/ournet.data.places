'use strict';

var Joi = require('vogels-helpers').Joi;

exports.GeoPlace = {
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
};

exports.GeoRegion = {
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
};

exports.GeoOldId = {
	id: Joi.number().integer().required(),
	geonameid: Joi.number().integer().required()
};

exports.GeoAltName = {
	id: Joi.number().integer().required(),
	geonameid: Joi.number().integer().required(),
	name: Joi.string().required(),
	isPreferred: Joi.boolean(),
	isShort: Joi.boolean(),
	isColloquial: Joi.boolean(),
	isHistoric: Joi.boolean()
};
