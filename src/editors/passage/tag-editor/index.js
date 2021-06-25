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
		...mapGetters(["allStories"]),
	},

	props: {
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	template: require('./index.html'),

	methods: {
		tagColors() {
			console.log("In tagcolors");
			let thisColor = this.allStories.find(s => s.id === this.storyId).tagColors;
			return "tag label label-info " + thisColor;
		},
		showNew() {
			this.newVisible = true;
			this.$nextTick(() => this.$els.newName.focus());
		},

		hideNew() {
			this.newVisible = false;
		},

		addNew() {
			const newName = this.$els.newName.value.replace(/\s/g, '-');

			/* Clear the newName element while it's transitioning out. */

			this.$els.newName.value = '';

			passageActions.updatePassage(
				this.storyId,
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