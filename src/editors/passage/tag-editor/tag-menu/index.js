import Vue from 'vue';
import { mapGetters } from 'vuex';
import without from 'lodash.without';
import locale from '../../../../locale';
import storyActions from '../../../../data/actions/story';
import passageActions from '../../../../data/actions/passage';
import dropdown from '../../../../ui/drop-down';

require('./index.less');

export default Vue.extend({
	props: {
		tag: {
			type: String,
			required: true
		},
		passage: {
			type: Object,
			required: true
		},
	},

	computed: {
		...mapGetters(["story"]),
	},

	template: require('./index.html'),

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	methods: {
		remove() {
			passageActions.updatePassage(
				this.$store,
				this.story,
				this.passage.id,
				{ tags: without(this.passage.tags, this.tag) }
			);
		},
		setColor(color) {
			storyActions.setTagColorInStory(this.$store, this.story, this.tag, color);
		}
	},

	components: {
		'drop-down': dropdown,
	}
});