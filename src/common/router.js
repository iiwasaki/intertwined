/* The router managing the app's views. */

import Vue from 'vue';
import VueRouter from 'vue-router';
const LocaleView = require('../locale/view');
const StoryEditView = require('../story-edit-view');
import StoryListView from '../story-list-view';
import WelcomeView from '../welcome';
const locale = require('../locale');
const { getStoryPlayHtml, getStoryProofingHtml, getStoryTestHtml } = require('./story-html');
const replaceUI = require('../ui/replace');
import store from '../data/store';
const FirebaseHandler = require('../data/firebase-handler').default;

Vue.use(VueRouter);
let router = new VueRouter({
	routes: [
		{path: '/locale', component: LocaleView},
		{path: '/welcome', component: WelcomeView},
		{path: '/stories', component: {
			template:
				'<div><story-list ' +
				':previously-editing="previouslyEditing"></story-list></div>',

			components: {'story-list': StoryListView},

			data() {
				return {
					previouslyEditing: this.$route.params
						? this.$route.params.previouslyEditing
						: ''
				};
			}
		}},
		{path: '/stories/:id', component: {
			template: '<div><story-edit :story-id="id"></story-edit></div>',

			components: {'story-edit': StoryEditView},

			data() {
				return {id: this.$route.params.id};
			}
		}},
		{path: '/stories/:id/play', component: {
			ready() {
				getStoryPlayHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your story. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}},
		{path: '/stories/:id/proof', component: {
			ready() {
				getStoryProofingHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your story. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}},

		{path: '/stories/:id/test', component: {
			ready() {
				getStoryTestHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your story. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}},

		{path: '/stories/:stodyId/test/:passageId', component:{
			ready() {
				getStoryTestHtml(
					this.$store,
					this.$route.params.storyId,
					this.$route.params.passageId
				)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your story. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}},

		// By default show story list
		{path: '*', redirect: '/stories'},
	]
});



router.beforeEach(function (to, from, next) {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/

	if (from.path && to.path === '/stories') {
		const editingId =
			from.path.match('^/stories/([^\/]+)$');

		if (editingId) {
			to.params.previouslyEditing = editingId[1];
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	const welcomeSeen = store.state.pref.welcomeSeen;
	if (to.path === '/welcome' || welcomeSeen) {
		next();
	}
	else {
		next('/welcome');
	}
});

export default router;
