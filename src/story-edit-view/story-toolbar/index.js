// The toolbar at the bottom of the screen with editing controls.

import Vue from 'vue';
import locale from '../../locale';
import zoomMappings from '../zoom-settings';
const {playStory, testStory} = require('../../common/launch-story');
import storyActions from '../../data/actions/story';
import storymenu from './story-menu';
import storysearch from './story-search';
import eventHub from '../../vue/eventhub';


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
			storyActions.updateStory(this.$store, this.story.id, this.story.groupName, {zoom: zoomMappings[description]});
		},

		test() {
			testStory(this.story.id);
		},

		play() {
			playStory(this.story.id);
		},

		addPassage() {
			this.$emit('passage-create');
		}
	},

});
