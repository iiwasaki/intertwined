/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
import Vue from 'vue';
import scroll from 'scroll';
const isElectron = require('../electron/is-electron');
import setPref from '../data/actions/pref';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* How many sections are currently visible. */
		shown: 1,
		isElectron: isElectron()
	}),

	methods: {
		next() {
			this.shown++;

			Vue.nextTick(() => {
				scroll.top(
					document.documentElement || document.body,
					document.querySelector('#welcomeView > div:last-of-type')
						.offsetTop,
					{duration: 400}
				);
			});
		},

		finish() {
			this.$store.commit("UPDATE_PREF", {name: 'welcomeSeen', value: true});
			this.$router.push('/stories');
		},

		parseIntoHtml(text) {
			return `${text}`;
		}
	},

	vuex: {
		actions: {
			setPref
		}
	}

});
