'use strict';

var Place = require('../place');

function setTypeKey(data) {
	if (typeof data.feature_code === 'undefined') {
		return;
	}
	// delete feature_code
	if (data.feature_code === null) {
		data.type_key = null;
		return;
	}

	if (!data.country_code) {
		throw new Error('Cannot set type_key without country_code');
	}
	if (data.feature_code.toUpperCase() === 'ADM1') {
		data.type_key = Place.formatTypeKey(data.country_code, 'adm1');
	} else if (~['PPLA', 'PPLC'].indexOf(data.feature_code.toUpperCase())) {
		data.type_key = Place.formatTypeKey(data.country_code, 'city');
	}
	data.type_key = null;
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
	setTypeKey(data);
	setAdm1Key(data);

	data.country_code = data.country_code.toLowerCase();

	return data;
}

function updateNormalize(data) {
	setTypeKey(data);
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
