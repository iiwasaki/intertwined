/* An editor for adding and removing tags from a passage. */

import Vue from 'vue';
import passageActions from '../../../data/actions/passage';
import uniq from 'lodash.uniq';
import { mapGetters } from 'vuex';
import tagmenu from './tag-menu';
import locale from '../../../locale';

export default Vue.extend({
	data: () => ({
		newVisible: false
	}),

	computed: {
		...mapGetters(["allStories", "story"]),
	},

	props: {
		passage: {
			type: Object,
			required: true
		},
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	template: require('./index.html'),

	methods: {
		tagColors(tag) {
			let thisColor = this.story.tagColors[tag];
			return "tag label label-info " + thisColor;
		},
		showNew() {
			this.newVisible = true;
			this.$nextTick(() => this.$refs.newName.focus());
		},

		hideNew() {
			this.newVisible = false;
		},

		addNew() {
			const newName = this.$refs.newName.value.replace(/\s/g, '-');

			/* Clear the newName element while it's transitioning out. */

			this.$refs.newName.value = '';

			passageActions.updatePassage(
				this.$store,
				this.story,
				this.passage.id,
				{
					tags: uniq([].concat(this.passage.tags, newName))
				}
			);

			this.hideNew();
		}
	},
	components: {
		'tag-menu': tagmenu,
	}
});