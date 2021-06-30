/**
 Shows a list of stories. Each list item is managed by a StoryItemView.

 @class StoryListView
 @extends Backbone.Marionette.CompositeView
**/

'use strict';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import locale from '../locale';
import ImportDialog from '../dialogs/story-import';
import listToolbar from './list-toolbar';
import storyitem from './story-item';
import filedragndrop from '../ui/file-drag-n-drop';
import eventHub from '../vue/eventhub';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	props: {
		appearFast: {
			type: Boolean,
			default: false
		},

		previouslyEditing: {
			type: String,
			default: null
		}
	},

	data: () => ({
		/*
		Set the default story list sorting to 'name', 'asc' (i.e. A → Z).
		*/

		storyOrder: 'name',
		storyOrderDir: 'asc'
	}),

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	beforeCreate(){
		this.$store.dispatch('bindStories');
	},

	beforeDestroy(){
		console.log("Story list being destroyed?");
	},

	computed: {
		...mapGetters(["stories"]),
		byDateClass() {
			return 'subtle' + (this.storyOrder === 'lastUpdate' ? ' active' : '');
		},
		byNameClass() {
			return 'subtle' + (this.storyOrder === 'name' ? ' active' : '');
		},
		lastUpdatei() {
			return 'fa fa-sort-amount-' + this.storyOrderDir;
		},
		namei() {
			return 'fa fa-sort-alpha-' + this.storyOrderDir;
		},
		showBrowserWarning() {
			if (!/Safari\//.test(navigator.userAgent)) {
				return false;
			}

			if (navigator.standalone) {
				// We are in iOS "standalone" or full-screen mode. This is supposed to have its own localStorage which is not subject to the seven-day limit.
				// https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
				return false;
			}

			// Safari 13.0 is OK, but anything after that isn't.

			const version = /Version\/13\.(\d)/.exec(navigator.userAgent);

			if (!version || !version[1] || version[1] === '0') {
				return false;
			}

			return true;
		},

		showiOSWarning() {
			// This returns true on iOS (whether in standalone mode or not). It returns false on MacOS.
			return (navigator.standalone !== undefined);
		},

		sortedStories() {
			/*
			If we have no stories to sort, don't worry about it.
			*/

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case 'name':
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (a.name < b.name) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				case 'lastUpdate':
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (aTime < bTime) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				default:
					throw new Error(
						`Don't know how to sort by "${this.storyOrder}"`
					);
			}
		},

		storyCountDesc() {
			return locale.sayPlural(
				'%d Story',
				'%d Stories',
				this.stories.length
			);
		}
	},

	watch: {
		storyCountDesc: {
			handler(value) {
				document.title = value;
			},

			immediate: true
		}
	},

	mounted() {
		/* If we were asked to appear fast, we do nothing. */

		if (this.appearFast) {
			return;
		}

		/*
		And if the user had been previously editing a story (as the router will
		tell us), we broadcast an event so that an appropriate child component
		can set up a zoom transition back into itself.
		*/

		if (this.previouslyEditing) {
			eventHub.$emit('previously-editing', this.previouslyEditing);
		}
	},

	methods: {
		sortByDate() {
			/*
			If the last story order was 'lastUpdate', toggle the story order
			direction.  Elsewise, default to 'desc' (i.e. newest -> oldest).
			*/

			if (this.storyOrder === 'lastUpdate') {
				this.storyOrderDir =
					this.storyOrderDir === 'asc' ? 'desc' : 'asc';
			} else {
				this.storyOrderDir = 'desc';
			}

			this.storyOrder = 'lastUpdate';
		},

		sortByName() {
			/*
			If the last story order was 'name', toggle the story order
			direction. Elsewise, default to 'asc' (i.e. A -> Z).
			*/

			if (this.storyOrder === 'name') {
				this.storyOrderDir =
					this.storyOrderDir === 'asc' ? 'desc' : 'asc';
			} else {
				this.storyOrderDir = 'asc';
			}

			this.storyOrder = 'name';
		}
	},

	components: {
		'story-item': storyitem,
		'list-toolbar': listToolbar,
		'file-drag-n-drop': filedragndrop,
	},

	events: {
		/*
		We reflect back `story-edit` events onto children, so that the
		appropriate StoryItem can edit itself, e.g. animate into editing.
		*/

		'story-edit'(id) {
			this.$broadcast('story-edit', id);
		},

		/* For now, we only support importing a single file at a time. */

		'file-drag-n-drop'(files) {
			new ImportDialog({
				store: this.$store,
				data: {
					immediateImport: files[0]
				}
			}).$mountTo(document.body);
		}
	},
});
