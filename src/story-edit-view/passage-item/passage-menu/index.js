/* A contextual menu that appears when the user points at a passage. */

import Vue from 'vue';
const {testStory} = require('../../../common/launch-story');
import passageActions from '../../../data/actions/passage';
import  storyActions from '../../../data/actions/story';
import dropdown from '../../../ui/drop-down';
import locale from '../../../locale';
import eventHub from '../../../vue/eventhub';
import confirmation from '../../../dialogs/confirm';

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

		deletePassage() {
			let message = locale.say(
				'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
				'This cannot be undone.',
				escape(this.passage.name)
			);

			confirmation.confirm({
				message,
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
				buttonClass:
					'danger',
				responseEvent: 'deletePassage',
				targetStoryId: this.parentStory.id,
				targetPassageId: this.passage.id
			});
		},

		test() {
			testStory(this.parentStory.id, this.passage.id);
		},

		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		setAsStart() {
				storyActions.updateStory(this.$store, this.parentStory.id, {
				startPassage: this.passage.id
			});
		},

		setSize(value) {
			switch (value) {
				case 'small':
					passageActions.updatePassage(this.$store, this.parentStory, this.passage.id, {
						width: 100,
						height: 100
					});
					break;

				case 'wide':
					passageActions.updatePassage(this.$store, this.parentStory, this.passage.id, {
						width: 200,
						height: 100
					});
					break;

				case 'tall':
					passageActions.updatePassage(this.$store, this.parentStory, this.passage.id, {
						width: 100,
						height: 200
					});
					break;

				case 'large':
					passageActions.updatePassage(this.$store, this.parentStory, this.passage.id, {
						width: 200,
						height: 200
					});
					break;

				default:
					throw new Error(`Don't know how to set size ${value}`);
			}

			eventHub.$emit('passage-position', this.passage, {});
		},
	},

	components: {
		'drop-down': dropdown,
	},

});
