// An individual item in the list managed by StoryListView.  This offers quick
// links for editing, playing, and deleting a story; StoryEditView handles more
// detailed changes.

'use strict';
import moment from 'moment';
import Vue from 'vue';
import ZoomTransition from '../zoom-transition';
import itempreview from './item-preview';
import itemmenu from './item-menu';
import eventHub from '../../vue/eventhub';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	components: {
		'item-preview': itempreview,
		'item-menu': itemmenu,
	},

	created() {
		eventHub.$on('previously-editing', this.previouslyEditing);
		eventHub.$on('story-edit', this.storyEdit);
	},

	beforeDestroy() {
		eventHub.$off('previously-editing', this.previouslyEditing);
		eventHub.$off('story-edit', this.storyEdit);
	},

	computed: {
		lastUpdateFormatted() {
			if (this.story.lastUpdate) {
				return moment(this.story.lastUpdate.toDate()).format('lll');
			}
			else {
				return moment(new Date()).format('lll');
			}
		},

		hue() {
			// A hue based on the story's name.

			let result = 0;

			for (let i = 0; i < this.story.name.length; i++) {
				result += this.story.name.charCodeAt(i);
			}

			return (result % 40) * 90;
		}
	},

	methods: {
		/**
		 Opens a StoryEditView for this story.

		 @method edit
		**/

		edit() {
			const pos = this.$el.getBoundingClientRect();
			new ZoomTransition({
				data: {
					x: pos.left + pos.width / 2,
					y: pos.top,
				},
			}).$mountTo(this.$el)
			.then(
				() => (this.$store.dispatch('bindStory', {
					storyId: this.story.id,
				}))
			)
			.then(
				() => (this.$router.push('/stories/' + this.story.id))
			);
		},
		// If our parent wants to edit our own model, then we do so. This is
		// done this level so that we animate the transition correctly.

		storyEdit(id) {
			if (this.story.id === id) {
				this.edit();
			}
		},

		// if we were previously editing a story, show a zoom shrinking back
		// into us. The signature is a little bit different to save time; we
		// know the ID of the story from the route, but don't have an object.

		previouslyEditing(id) {
			if (id === this.story.id) {
				// The method for grabbing the page position of our element is
				// cribbed from http://youmightnotneedjquery.com/.

				let rect = this.$el.getBoundingClientRect();

				new ZoomTransition({
					data: {
						reverse: true,
						x: rect.left + (rect.right - rect.left) / 2,
						y: rect.top + (rect.bottom - rect.top) / 2
					}
				}).$mountTo(document.body);
			}
		}
	}
});
