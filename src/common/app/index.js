// The main app running the show.

'use strict';
import Vue from 'vue';
import ui from '../../ui';
const {repairFormats} = require('../../data/actions/story-format');
const {repairStories} = require('../../data/actions/story');
import store from '../../data/store';
import router from '../router';

export default new Vue({
	el: "#main",
	router: router,
	template: '<router-view></router-view>',

	ready() {
		ui.init();
		this.repairFormats();
		this.repairStories();
		document.body.classList.add(`theme-${this.themePref}`);
	},

	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},

	vuex: {
		actions: {repairFormats, repairStories},
		getters: {
			themePref: state => state.pref.appTheme
		}
	},

	store
});
