/**
 Each individual circle generated for the preview item
**/

'use strict';
import Vue from 'vue';

const passageCenterOffset = 50;

function passageRadius(length, longestLength) {
	return (200 + 200 * (length / longestLength)) / 2;
}

export default Vue.extend({
	template: require('./index.html'),

	props: {
		maxlength: {
			type: Number,
			required: true
		},
		hue: {
			type: Number,
			required: true
		},
		passage: {
			type: Object,
			required: true
		}
	},

	computed: {
		passageStroke() {
			return `hsl(${this.hue}, 90%, 45%)`;
		},

		passageFill() {
			return `hsla(${this.hue}, 90%, 60%, 0.5)`;
		},

		circleCx() {
			return this.passage.left + passageCenterOffset;
		},

		circleCy() {
			return this.passage.top + passageCenterOffset;
		},

		circleR() {
			return passageRadius(this.passage.text.length, this.maxlength);
		}
	}
});
