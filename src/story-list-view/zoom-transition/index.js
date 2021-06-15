'use strict';
import Vue from 'vue';
//import { ZOOM_MAPPINGS } from '../../story-edit-view';
import {thenable, symbols} from '../../vue/mixins/thenable';

require('./index.less');

const ZoomTransition = Vue.extend({
	data: () => ({
		zoom: 0,
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		url: '',
		reverse: false,
	}),

	template: require('./index.html'),

	computed: {
		zoomClass() {
			// for (let desc in ZOOM_MAPPINGS) {
			// 	if (ZOOM_MAPPINGS[desc] === this.zoom) {
			// 		return 'zoom-' + desc;
			// 	}
			// }

			return '';
		},
	},

	mounted() {
		/*
		Ugly hack to make this work on NW.js, which Vue doesn't seem to process
		animation events correctly for.
		*/
		window.setTimeout(this.animationend, 200);
	},

	methods: {
		animationend() {
			this[symbols.resolve]();

			/*
			Do not destroy this immediately: consumers may want to do an
			operation and call $destroy() on this afterward.
			*/
		},
	},

	mixins: [thenable]
});

export default ZoomTransition;