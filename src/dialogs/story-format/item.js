// Shows a single story format, with a radio button to allow the user to
// choose it.

import Vue from 'vue';
import storyActions from '../../data/actions/story';

require('./item.less');

export default Vue.extend({
	template: require('./item.html'),

	props: {
		story: {
			type: Object,
			required: true
		},

		format: {
			type: Object,
			required: true
		}
	},

	computed: {
		author(){
			return this.format.properties.author;
		},
		formId(){
			return this.format.name - this.format.properties.version;
		},

		selected() {
			return this.story.storyFormat === this.format.name &&
				this.story.storyFormatVersion === this.format.version;
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');

			return path + '/' + this.format.properties.image;
		}
	},

	methods: {
		select() {
			storyActions.updateStory(
				this.$store,
				this.story.id,
				{
					storyFormat: this.format.name,
					storyFormatVersion: this.format.version
				}
			);
		}
	},

});
