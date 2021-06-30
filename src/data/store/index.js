/*
The main module managing the application's Vuex state and mutations.
*/

import Vue from 'vue';
import Vuex from 'vuex';
import {vuexfireMutations, firestoreAction} from 'vuexfire';
import {db} from "../firebase-handler";
import prefs from './pref';
import appInfo from './app-info';
import story from './story';
import storyFormat from './story-format';
import localstorage from '../local-storage';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		appInfo: appInfo,
		pref: prefs,
		story: story,
		storyFormat: storyFormat,
	},

	mutations: {
		...vuexfireMutations,
	},

	plugins: [
		localstorage
	]
});
