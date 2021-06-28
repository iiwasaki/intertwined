// A drop-down menu with miscellaneous editing options for a story.

import escape from 'lodash.escape';
import Vue from 'vue';
import {mapGetters} from 'vuex';
const FormatDialog = require('../../../dialogs/story-format');
const JavaScriptEditor = require('../../../editors/javascript');
import StatsDialog from '../../../dialogs/story-stats';
const StylesheetEditor = require('../../../editors/stylesheet');
import formatActions from '../../../data/actions/story-format';
import locale from '../../../locale';
const {proofStory} = require('../../../common/launch-story');
import prompter from '../../../dialogs/prompt';
const {publishStoryWithFormat} = require('../../../data/publish');
const save = require('../../../file/save');
import passageActions from '../../../data/actions/passage';
import storyActions from '../../../data/actions/story';
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
		//eventHub.$on('deleteStory', this.deleteStoryPost);
		eventHub.$on('renameStory', this.renameStoryPost);
		//eventHub.$on('duplicateStory', this.duplicateStoryPost);
	},

	beforeDestroy(){
		//eventHub.$off('deleteStory', this.deleteStoryPost);
		eventHub.$off('renameStory', this.renameStoryPost);
		//eventHub.$off('renameStory', this.duplicateStoryPost);
	},

	computed: {
		...mapGetters(["allFormats", "appInfo", "defaultFormatName"]),
	},

	methods: {
		editScript(e) {
			/*
			We have to manually inject the Vuex store, since the editors are
			mounted outside the app scope.
			*/

			new JavaScriptEditor({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},

		editStyle(e) {
			new StylesheetEditor({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},

		renameStory(e) {
			prompter.prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.'),
				origin: e.target,
				responseEvent: "renameStory",
				targetStoryId: this.story.id,
			});
		},

		/**
		 * This event/method will be fired by the prompt popup if they accept the
		 * story rename.
		 */
		 renameStoryPost(toRenameId, newName){
			if (toRenameId === this.story.id){
				storyActions.updateStory(this.$store, this.story.id, {name: newName});
			}
		},

		selectAll() {
			passageActions.selectPassages(this.$store, this.story.id, () => true);
		},

		proofStory() {
			proofStory(this.story.id);
		},

		publishStory() {
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

		storyStats(e) {
			new StatsDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},

		changeFormat(e) {
			new FormatDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},

		toggleSnap() {
			storyActions.updateStory(this.$store, this.story.id, {
				snapToGrid: !this.story.snapToGrid
			});
		}
	},

	components: {
		'drop-down': dropdown,
	},

});
