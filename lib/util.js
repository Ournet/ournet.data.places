'use strict';

var core = require('ournet.core');
var _ = core._;
var internal = {};

exports.sortPlaces = function(places) {
	if (!places) {
		return places;
	}
	return _.sortBy(places, 'name');
};

exports.shortAdm1Name = function(place, lang) {
	if (!lang) {
		throw new Error('lang param is required!');
	}
	var name = place.getName(lang);
	if (!name) {
		return name;
	}

	switch (place.country_code) {
		case 'al':
			switch (place.asciiname) {
				case 'Qarku i Beratit':
					return 'Berat';
				case 'Qarku i Tiranes':
					return 'Tirana';
				case 'Qarku i Dibres':
					return 'Dibër';
				case 'Qarku i Elbasanit':
					return 'Elbasan';
				case 'Qarku i Gjirokastres':
					return 'Gjirokastër';
				case 'Qarku i Korces':
					return 'Korçë';
				case 'Qarku i Kukesit':
					return 'Kukës';
				case 'Qarku i Durresit':
					return 'Durrës';
				case 'Qarku i Fierit':
					return 'Fier';
				case 'Qarku i Lezhes':
					return 'Lezhë';
				case 'Qarku i Shkodres':
					return 'Shkodër';
				case 'Qarku i Vlores':
					return 'Vlorë';
			}
			break;
		case 'lv':
			return name.replace(' Rajons', '').replace(' Novads', '');
		case 'lt':
			return name.replace(' Apskritis', '');
		case 'ro':
			return name.replace('Judeţul ', '').replace('Municipiul ', '').replace('Judetul ', '').replace('Județul ', '');
		case 'md':
			return name.replace('Judeţul ', '').replace('Municipiul ', '').replace('Judetul ', '').replace('Raionul ', '').replace('Județul ', '')
				.replace('Unitatea Teritorială din Stînga Nistrului', 'Transnistria')
				.replace('Municipiu ', '').replace('Unitate Teritorială Autonomă Găgăuzia', 'Gagauzia')
				.replace('Unitate Teritoriala Autonoma Gagauzia', 'Găgăuzia');
		case 'ru':
			return name.replace('Республика ', '');
		case 'in':
			return name.replace('National Capital Territory of ', '').replace('Union Territory of ', '').replace('State of ', '');
		case 'hu':
			return name.replace(' főváros', '').replace(' fovaros', '').replace(' megye', '');
		case 'bg':
			return name.replace('Област ', '');
		case 'mx':
			return name.replace('Estado de ', '');
		case 'pl':
			return core.util.startWithUpperCase(name.replace('Województwo ', ''));
	}

	return name;
};

exports.inCountryName = function(country, lang) {
	switch (lang) {
		case 'ru':
			if (country[country.length - 1] === 'я') {
				return country.substring(0, country.length - 1) + 'и';
			}
			if (country === 'Молдова') {
				return 'Молдове';
			}
			if (country === 'Украина') {
				return 'Украине';
			}
			if (country === 'Беларусь') {
				return 'Беларуси';
			}
			break;
		case 'uk':
			if (country === 'Україна') {
				return 'Україні';
			}
			break;
		case 'cs':
			return 'ČR';
		case 'pl':
			if (country === 'Polska') {
				return 'Polsce';
			}
			break;
	}
	return country;
};

exports.inPlaceName = function(place, lang) {
	var name = place.getName(lang);
	switch (lang) {
		case 'ru':
			return internal.rusEndName(name);
		case 'uk':
			return internal.ukrEndName(name);
	}
	return name;
};

exports.isTown = function(place) {
	return place.feature_class === 'P' && (place.feature_code === 'PPLC' || place.feature_code === 'PPLA');
};

exports.isCity = function(place, minPopulation) {
	minPopulation = minPopulation || 10000;
	return place.FeatureClass === 'P' && place.population >= 10000;
};

exports.isAdm = function(place) {
	return place.feature_class === 'A';
};

exports.isPopulatedPlace = function(place) {
	return place.feature_class === 'P';
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
		if (langs.indexOf(lang) > -1){
			list.push(item);
		}
	});
	if (list.length === 0) {
		return null;
	}
	return list.join(';');
};

internal.RUS_END_REPLACE = {
	'ль': 'ле'
};

internal.rusEndName = function(name) {
	for (var key in internal.RUS_END_REPLACE) {
		if (core.util.endsWith(name, key, true)) {
			return name.substr(0, name.length - key.length) + internal.RUS_END_REPLACE[key];
		}
	}

	switch (name[name.length - 1]) {
		case 'р':
		case 'г':
		case 'д':
		case 'к':
		case 'т':
		case 'в':
			return name + 'е';
		case 'ь':
			return name.substr(0, name.length - 1) + 'и';
		case 'а':
			return name.substr(0, name.length - 1) + 'е';
		case 'б':
			//case 'в':
			return name;
	}
	return name;
};
