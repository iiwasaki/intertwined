// Handles the cog menu for a single story.

import escape from 'lodash.escape';
import Vue from 'vue';
import {mapGetters} from 'vuex';
import confirmer from '../../../dialogs/confirm';
import storyActions from '../../../data/actions/story';
import formatActions from '../../../data/actions/story-format';
const {playStory, testStory} = require('../../../common/launch-story');
import prompter from '../../../dialogs/prompt';
import locale from  '../../../locale';
const {publishStoryWithFormat} = require('../../../data/publish');
const save = require('../../../file/save');
import dropdown from '../../../ui/drop-down';
import eventHub from '../../../vue/eventhub';

export default Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	created(){
		eventHub.$on('deleteStory', this.deleteStoryPost);
		eventHub.$on('renameStory', this.renameStoryPost);
		eventHub.$on('duplicateStory', this.duplicateStoryPost);
	},

	beforeDestroy(){
		eventHub.$off('deleteStory', this.deleteStoryPost);
		eventHub.$off('renameStory', this.renameStoryPost);
		eventHub.$off('renameStory', this.duplicateStoryPost);
	},

	components: {
		'drop-down': dropdown,
	},

	computed: {
		...mapGetters(["allFormats", "appInfo", "defaultFormat"]),
	},

	methods: {
		/**
		 Plays this story in a new tab.

		 @method play
		**/

		play() {
			playStory(this.story.id);
		},

		/**
		 Tests this story in a new tab.

		 @method test
		**/

		test() {
			testStory(this.story.id);
		},

		/**
		 Downloads the story to a file.

		 @method publish
		**/

		publish() {
			formatActions.loadFormat(
				this.$store,
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			});
		},

		/**
		 Shows a confirmation before deleting the model.

		 @method confirmDelete
		**/

		deleteStory() {
			confirmer.confirm({
				message: locale.say(
					'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
						'This cannot be undone.',
					escape(this.story.name)
				),
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' +
					locale.say('Delete Forever'),
				buttonClass: 'danger',
				responseEvent: 'deleteStory',
				targetStoryId: this.story.id,
			});
		},

		/**
		 * This event/method will be fired by the confirmation popup if they accept the
		 * story deletion.
		 */
		deleteStoryPost(toDeleteId){
			if (toDeleteId === this.story.id){
				storyActions.deleteStory(this.$store, toDeleteId, this.story.groupName);
			}
		},

		/**
		 Prompts the user for a new name for the story, then saves it.

		 @method rename
		**/

		rename() {
			prompter.prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.'),
				responseEvent: "renameStory",
				targetStoryId: this.story.id,
			});
		},

		/**
		 * This event/method will be fired by the prompt popup if they accept the
		 * story rename.
		 */
		 async renameStoryPost(toRenameId, newName){
			if (toRenameId === this.story.id){
				await storyActions.updateStory(this.$store, this.story.id, this.story.groupName, {name: newName, lastUpdate: new Date() });
			}
		},


		/**
		 Prompts the user for a name, then creates a duplicate version of this
		 story accordingly.
		**/

		duplicate() {
			prompter.prompt({
				message: locale.say('What should the duplicate be named?'),
				buttonLabel:
					'<i class="fa fa-copy"></i> ' + locale.say('Duplicate'),
				response: locale.say('%s Copy', this.story.name),
				blankTextError: locale.say('Please enter a name.'),
				responseEvent: "duplicateStory",
				targetStoryId: this.story.id,
			});
		},
	},

});
