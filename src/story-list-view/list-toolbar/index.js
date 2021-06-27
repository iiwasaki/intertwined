// The side toolbar of a story list.

import Vue from 'vue';
import AboutDialog from '../../dialogs/about';
const FormatsDialog = require('../../dialogs/formats');
const ImportDialog = require('../../dialogs/story-import');
import storyActions from '../../data/actions/story';
import locale from '../../locale';
import prompter from '../../dialogs/prompt';
const {publishArchive} = require('../../data/publish');
const saveFile = require('../../file/save');
import {mapGetters} from 'vuex';
import themeswitcher from './theme-switcher';
import eventHub from '../../vue/eventhub';

export default Vue.extend({
	template: require('./index.html'),

	created(){
		eventHub.$on('newStory', this.createNewStory);
	},

	beforeDestroy(){
		eventHub.$off('newStory', this.createNewStory);
	},

	methods: {
		createNewStory(name){
			storyActions.createStory(this.$store, {name: name});
			/* Allow the appearance animation to complete. */

			window.setTimeout(() => {
				eventHub.$emit(
					'story-edit',
					this.existingStories.find(story => story.name === name)
						.id
				);
			}, 300);
		},
		createStoryPrompt(e) {
			// Prompt for the new story name.

			prompter.prompt({
				message: locale.say(
					'What should your story be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (
						this.existingStories.find(story => story.name === name)
					) {
						return locale.say(
							'A story with this name already exists.'
						);
					}
				},
				responseEvent: 'newStory',
				origin: e.target
			});
		},

		importFile(e) {
			new ImportDialog({
				store: this.$store,
				data: {origin: e.target}
			}).$mountTo(document.body);
		},

		saveArchive() {
			const timestamp = new Date()
				.toLocaleString()
				.replace(/[\/:\\]/g, '.');

			saveFile(
				publishArchive(this.existingStories, this.appInfo),
				`${timestamp} ${locale.say('Twine Archive.html')}`
			);
		},

		showAbout(e) {
			new AboutDialog({
				store: this.$store,
				data: {origin: e.target}
			}).$mountTo(document.body);
		},

		showFormats(e) {
			new FormatsDialog({
				store: this.$store,
				data: {origin: e.target}
			}).$mountTo(document.body);
		},

		showHelp() {
			window.open('https://twinery.org/2guide');
		},

		showLocale() {
			window.location.hash = 'locale';
		}
	},

	computed: {
		...mapGetters({
			appInfo: 'appInfo',
			existingStories: 'stories',
		}),
		newStoryTitle() {
			return locale.say('Create a brand-new story');
		},
		importStoryTitle() {
			return locale.say('Import a published story or Twine archive');
		},
		saveArchiveTitle() {
			return locale.say('Save all stories to a Twine archive file');
		},
		workWithProofingTitle(){
			return locale.say('Work with story and proofing formats');
		},
		changeLanguageTitle() {
			return locale.say('Change the language Twine uses');
		},
		helpTitle() {
			return locale.say('Browse online help');
		},
		storySay() {
			return locale.say('Story');
		},
		twineSay() {
			return locale.say('Twine');
		},
		importSay(){
			return locale.say
		}
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	components: {
		'theme-switcher': themeswitcher,
	},

});
