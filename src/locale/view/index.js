/*
Allows the user to pick what locale they would like to use.
*/

import Vue from 'vue';
import prefActions from '../../data/actions/pref';
import {mapGetters} from 'vuex';
import locale from '../index.js';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),
	data: () => ({
		/* The locales we offer with their codes. */

		locales: [
			{label: 'Castellano', code: 'es'},
			{label: 'Catal&agrave;', code: 'ca'},
			{label: '&Ccaron;e&scaron;tina', code: 'cs'},
			{label: 'Chinese', code: 'zh-cn'},
			{label: 'Dansk', code: 'da'},
			{label: 'Deutsch', code: 'de'},
			{label: 'English', code: 'en'},
			{label: 'Fran&ccedil;ais', code: 'fr'},
			{label: 'Italiano', code: 'it'},
			{label: 'Bahasa Melayu', code: 'ms'},
			{label: 'Nederlands', code: 'nl'},
			{label: '日本語', code: 'jp'},
			{label: 'Portugu&ecirc;s', code: 'pt-pt'},
			{label: 'Portugu&ecirc;s Brasileiro', code: 'pt-br'},
			{label: 'русский', code: 'ru'},
			{label: 'Slovenščina', code: 'sl'},
			{label: 'Suomi', code: 'fi'},
			{label: 'Svenska', code: 'sv'},
			{label: 'T&uuml;rk&ccedil;e', code: 'tr'},
			{label: 'Українська (клясична)', code: 'uk'}
		]
	}),
	computed: {
		...mapGetters({
			localePref: 'localePref',
		}),
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	methods: {
		/*
		Sets the application locale and forces a window reload
		back to the story list.
		*/

		setLocale(userLocale) {
			prefActions.setPref(this.$store, 'locale', userLocale);
			this.$router.push('/stories');
			window.location.reload(true);
		}
	},
});
