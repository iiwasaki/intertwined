/*
A toggle between light and dark themes.
*/

import Vue from 'vue';
import setPref from '../../data/actions/pref';
import {mapGetters} from 'vuex';
import locale from '../../locale';

export default Vue.extend({
	template: require('./theme-switcher.html'),

	methods: {
		setTheme(value) {
			this.$store.commit("UPDATE_PREF", {name: 'appTheme', value: value});
		}
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	computed: {
		...mapGetters(["themePref"]),

		checkLightTheme() {
			return (this.themePref === 'light') && 'active';
		},
		checkDarkTheme() {
			return (this.themePref === 'dark') && 'active';
		}
	},

	vuex: {
		actions: {
			setPref
		},
	}
});

