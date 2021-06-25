import Vue from 'vue';
import without from 'lodash.without';
const { setTagColorInStory } = require('../../../../data/actions/story');
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
		storyId: {
			type: String,
			required: true
		}
	},

	template: require('./index.html'),

	methods: {
		remove() {
			passageActions.updatePassage(
				this.$store,
				this.storyId,
				this.passage.id,
				{ tags: without(this.passage.tags, this.tag) }
			);
		},
		setColor(color) {
			this.setTagColorInStory(this.storyId, this.tag, color);
		}
	},

	vuex: {
		actions: { setTagColorInStory }
	},

	components: {
		'drop-down': dropdown,
	}
});