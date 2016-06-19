'use strict';

var vogels = require('vogels-helpers');
var schemas = require('./schemas');
var placeConfig = require('./place_config');

exports.GeoPlace = vogels.define('GeoPlace', {
	tableName: 'GeoPlaces',
	hashKey: 'id',
	schema: schemas.GeoPlace,
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
	}, {
		hashKey: 'type_key',
		rangeKey: 'population',
		type: 'global',
		name: 'GeoPlacesTypeIndex'
	}]
}, placeConfig);

exports.GeoRegion = vogels.define('GeoRegion', {
	tableName: 'GeoAdmin1',
	hashKey: 'country_code',
	rangeKey: 'id',
	schema: schemas.GeoRegion,
	indexes: [{
		hashKey: 'country_code',
		rangeKey: 'admin1_code',
		type: 'local',
		name: 'GeoAdmin1CodeIndex'
	}]
});

exports.GeoOldId = vogels.define('GeoOldId', {
	tableName: 'GeoOldIds',
	hashKey: 'id',
	schema: schemas.GeoOldId
});

exports.GeoAltName = vogels.define('GeoAltName', {
	tableName: 'GeoNames',
	hashKey: 'geonameid',
	rangeKey: 'id',
	schema: schemas.GeoAltName
});
