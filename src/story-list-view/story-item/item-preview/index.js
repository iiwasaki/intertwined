/**
 This class generates SVG previews of stories.
 @class StoryItemView.Preview
**/

'use strict';
import Vue from 'vue';
import previewcircle from '../preview-circle';

const passageCenterOffset = 50;

function passageRadius(length, longestLength) {
	return (200 + 200 * (length / longestLength)) / 2;
}

export default Vue.extend({
	template: require('./index.html'),

	components: {
		'preview-circle': previewcircle,
	},

	props: {
		edit: {
			type: Function,
			required: true
		},
		hue: {
			type: Number,
			required: true
		},
		passages: {
			type: Array,
			required: true
		}
	},

	methods: {
		longestPassageLength() {
			let maxLength = 0;
			
			this.passages.forEach(passage => {
				const len = passage.text.length;

				if (len > maxLength) {
					maxLength = len;
				}
			});
			
			return maxLength;
		},
	},

	computed: {
		style() {
			return {
				background: `hsl(${this.hue}, 60%, 95%)`
			};
		},

		passageStroke() {
			return `hsl(${this.hue}, 90%, 45%)`;
		},

		passageFill() {
			return `hsla(${this.hue}, 90%, 60%, 0.5)`;
		},

		svgViewBox() {
			if (this.passages.length <= 1) {
				return '0 0 200 200';
			}

			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;
			
			this.passages.forEach(p => {
				const x = p.left + passageCenterOffset;
				const y = p.top + passageCenterOffset;
				const radius = passageRadius(
					p.text.length,
					this.longestPassageLength()
				);

				if (x - radius < minX) { minX = x - radius; }
				
				if (x + radius > maxX) { maxX = x + radius; }

				if (y - radius < minY) { minY = y - radius; }

				if (y + radius > maxY) { maxY = y + radius; }
			});

			return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
		}
	}
});
