// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
import locale from '../../locale';
const zoomMappings = require('../zoom-settings');
const {playStory, testStory} = require('../../common/launch-story');
const {updateStory} = require('../../data/actions/story');
import storymenu from './story-menu';
import storysearch from './story-search';


require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		},

		zoomDesc: {
			type: String,
			required: true
		}
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	components: {
		'story-menu': storymenu,
		'story-search': storysearch,
	},

	methods: {
		setZoom(description) {
			this.updateStory(this.story.id, {zoom: zoomMappings[description]});
		},

		test() {
			testStory(this.$store, this.story.id);
		},

		play() {
			playStory(this.$store, this.story.id);
		},

		addPassage() {
			this.$dispatch('passage-create');
		}
	},

	vuex: {
		actions: {
			updateStory
		}
	}
});
