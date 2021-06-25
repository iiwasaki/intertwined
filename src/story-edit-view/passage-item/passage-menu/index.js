/* A contextual menu that appears when the user points at a passage. */

import Vue from 'vue';
const {testStory} = require('../../../common/launch-story');
const {updatePassage, default: passage} = require('../../../data/actions/passage');
const {updateStory} = require('../../../data/actions/story');
import dropdown from '../../../ui/drop-down';
import locale from '../../../locale';
import eventHub from '../../../vue/eventhub';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	props: {
		passage: {
			type: Object,
			required: true
		},

		parentStory: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		expanded: false
	}),

	created(){
		eventHub.$on('drop-down-opened', this.dropDownOpened);
	},

	beforeDestroy(){
		eventHub.$on('drop-down-opened', this.dropDownOpened);
	},

	computed: {
		isStart() {
			return this.parentStory.startPassage === this.passage.id;
		},

		deleteTitle() {
			var title = locale.say("Delete ");
			title += '"';
			title += locale.say(this.passage.name);
			title += '"';
			return title;
		},

		editTitle() {
			var title = locale.say("Edit ");
			title += '"';
			title += locale.say(this.passage.name);
			title += '"';
			return title;
		},

		size() {
			if (this.passage.width === 100 && this.passage.height === 100) {
				return 'small';
			}

			if (this.passage.width === 200 && this.passage.height === 100) {
				return 'wide';
			}

			if (this.passage.width === 100 && this.passage.height === 200) {
				return 'tall';
			}

			if (this.passage.width === 200 && this.passage.height === 200) {
				return 'large';
			}
		}
	},

	watch: {
		expanded() {
			eventHub.$emit('drop-down-reposition');
		}
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	methods: {
		dropDownOpened() {
			this.expanded = false;
		},

		edit() {
			eventHub.$emit('passage-edit', this.passage.id);
		},

		deletePassage(e) {
			eventHub.$emit('passage-delete', e.shiftKey);
		},

		test() {
			testStory(this.$store, this.parentStory.id, this.passage.id);
		},

		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		setAsStart() {
			this.updateStory(this.parentStory.id, {
				startPassage: this.passage.id
			});
		},

		setSize(value) {
			switch (value) {
				case 'small':
					this.updatePassage(this.parentStory.id, this.passage.id, {
						width: 100,
						height: 100
					});
					break;

				case 'wide':
					this.updatePassage(this.parentStory.id, this.passage.id, {
						width: 200,
						height: 100
					});
					break;

				case 'tall':
					this.updatePassage(this.parentStory.id, this.passage.id, {
						width: 100,
						height: 200
					});
					break;

				case 'large':
					this.updatePassage(this.parentStory.id, this.passage.id, {
						width: 200,
						height: 200
					});
					break;

				default:
					throw new Error(`Don't know how to set size ${value}`);
			}

			this.$dispatch('passage-position', this.passage, {});
		},
	},

	components: {
		'drop-down': dropdown,
	},

	vuex: {
		actions: {updatePassage, updateStory}
	}
});
