// A module that adds locale-oriented filters to Vue.

import locale from '../../locale';

export default {
	addTo(Vue) {
		Vue.filter('say', locale.say.bind(locale));
		Vue.filter('sayPlural', locale.sayPlural.bind(locale));
	}
};
