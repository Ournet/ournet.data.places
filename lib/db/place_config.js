'use strict';

var Place = require('../place');

function setType(data) {

	if (typeof data.feature_code === 'undefined') {
		return;
	}
	// delete feature_code
	if (data.feature_code === null) {
		data.type_adm1 = null;
		data.type_city = null;
		return;
	}

	if (!data.country_code) {
		throw new Error('Cannot set type_TYPE without country_code');
	}
	if (data.feature_code.toUpperCase() === 'ADM1') {
		data.type_adm1 = data.country_code.toLowerCase();
		data.type_city = null;
	} else if (~['PPLA', 'PPLC'].indexOf(data.feature_code.toUpperCase())) {
		data.type_city = data.country_code.toLowerCase();
		data.type_adm1 = null;
	} else {
		data.type_adm1 = null;
		data.type_city = null;
	}
}

function setAdm1Key(data) {
	if (typeof data.admin1_code === 'undefined') {
		return;
	}
	// delete feature_code
	if (data.admin1_code === null) {
		data.adm1_key = null;
		return;
	}

	if (!data.country_code) {
		throw new Error('Cannot set adm1_key without country_code');
	}

	data.adm1_key = Place.formatAdm1Key(data.country_code, data.admin1_code);
}

function createNormalize(data) {
	setType(data);
	setAdm1Key(data);

	data.country_code = data.country_code.toLowerCase();

	Object.keys(data).forEach(function(key) {
		if (~[undefined, null].indexOf(data[key])) {
			delete data[key]
		}
	});

	return data;
}

function updateNormalize(data) {
	setType(data);
	setAdm1Key(data);

	if (data.country_code) {
		data.country_code = data.country_code.toLowerCase();
	}

	return data;
}

module.exports = {
	// updateSchema: updateSchema,
	createNormalize: createNormalize,
	updateNormalize: updateNormalize
};
