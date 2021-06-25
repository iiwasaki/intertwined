// The main app running the show.

'use strict';
import Vue from 'vue';
import ui from '../../ui';
import formatActions from '../../data/actions/story-format';
const {repairStories} = require('../../data/actions/story');
import store from '../../data/store';
import router from '../router';
import { mapGetters } from 'vuex';

export default new Vue({
	el: "#main",
	router: router,
	template: '<router-view></router-view>',

	mounted() {
		ui.init();
		formatActions.repairFormats(this.$store);
		//this.repairStories();
		document.body.classList.add(`theme-${this.themePref}`);
	},

	computed: {
		...mapGetters(["themePref"]),
	},

	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},
	store
});
