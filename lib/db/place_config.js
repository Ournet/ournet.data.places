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

function createNormalize(data) {
	setTypeKey(data);
}

function updateNormalize(data) {
	setTypeKey(data);
}

module.exports = {
	// updateSchema: updateSchema,
	createNormalize: createNormalize,
	updateNormalize: updateNormalize
};
