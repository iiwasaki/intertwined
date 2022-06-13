/*
A Vuex module for working with stories. This is meant to be incorporated by
index.js.
*/

import uuid from 'tiny-uuid';
import locale from '../../locale';
import idFor from '../id';
import ui from '../../ui';
import {vuexfireMutations, firestoreAction} from 'vuexfire';
import FirebaseHandler, { firepadRef } from "../firebase-handler";
import {storyCollection, groupCollection} from "../firebase-handler";
import firebase from 'firebase/app';

/*
A shorthand function for finding a particular story in the state, or a
particular passage in a story.
*/

function getStoryById(state, id) {
	let story = state.stories.find(story => story.id === id);

	if (!story) {
		throw new Error(`No story exists with id ${id}`);
	}

	return story;
}

function getPassageInStory(story, id) {
	let passage = story.passages.find(passage => passage.id === id);

	if (!passage) {
		throw new Error(`No passage exists in this story with id ${id}`);
	}

	return passage;
}

const storyStore = {
	/* These state objects are filled in by Vuexfire to keep the synchronization between
	 * the Firebase cloud store database and the app.
	 * 'stories' will have ALL stories.
	 * 'story' will have the one story being actively edited.
	 */
	state: {
		stories: [],
		story: Object,
	},

	mutations: {

		IMPORT_STORY(state, payload) {
			let toImport = payload.toImport;
			/*
			See data/import.js for how the object that we receive is
			structured.

			Assign IDs to to everything, link passages to their story,
			and set the story's startPassage property appropriately.
			*/

			toImport.id = idFor(toImport.name);

			toImport.passages.forEach(p => {
				p.id = idFor(toImport.name + p.name);
				p.story = toImport.id;

				if (p.pid === toImport.startPassagePid) {
					toImport.startPassage = p.id;
				}

				delete p.pid;
			});

			delete toImport.startPassagePid;
			state.stories.push(toImport);
		},

	},

	actions:{
		bindStories: firestoreAction(({ bindFirestoreRef }, payload) => {
			console.log("Binding all stories");
			return bindFirestoreRef('stories', storyCollection.orderBy(payload.order, payload.dir));
		}),

		unbindStories: firestoreAction (({ unbindFirestoreRef }) => {
			console.log("Unbinding all stories");
			unbindFirestoreRef('stories')
		}),

		bindStory: firestoreAction(({ bindFirestoreRef }, payload) => {
			console.log("Binding individual story (in store -> story.js)");
			return bindFirestoreRef('story', storyCollection.doc(payload.storyId));
		}),

		unbindStory: firestoreAction (({ unbindFirestoreRef }) => {
			console.log("Unbinding individual story (in store -> story.js)");
			unbindFirestoreRef('story');
		}),

		deleteStory: firestoreAction ((context, storyId) => {
			console.log("in delete story vuexfire action");
			const Firepad = require('firepad');
			var storyRef = firepadRef.child(storyId).remove();
			return storyCollection.doc(storyId).delete();
		}),

		updateStory: firestoreAction(({ state }, payload) => {
			let id = payload.id;
			console.log("Id is: ");
			console.log(id);
			let props = payload.props;
			return storyCollection.doc(id).update(props).then(() => {
				console.log("Story updating with vuex!");
			});
		}),

		duplicateStory: firestoreAction(({state}, payload) => {
			console.log("in duplicate story vuex");
			let id = payload.id;
			let newName = payload.newName;
			const original = getStoryById(state, id);
			console.log(original);

			let story = Object.assign({}, original, {
				id: idFor(newName),
				ifid: uuid().toUpperCase(),
				name: newName
			});

			/* We need to do a deep copy of the passages. */

			story.passages = [];
			original.passages.forEach(originalPassage => {
				const passage = Object.assign({}, originalPassage, {
					id: idFor(newName + originalPassage.name),
					story: story.id
				});

				if (passage.tags) {
					passage.tags = passage.tags.slice(0);
				}

				if (original.startPassage === originalPassage.id) {
					story.startPassage = passage.id;
				}

				story.passages.push(passage);
			});
			return storyCollection.add(story);
		}),

		createStory: firestoreAction(({ state }, props) => {
			let story = Object.assign(
				{
					id: idFor(props.name),
					lastUpdate: new Date(),
					ifid: uuid().toUpperCase(),
					tagColors: {},
					passages: []
				},
				storyStore.storyDefaults,
				props
			);

			if (story.passages) {
				story.passages.forEach(passage => (passage.story = story.id));
			}
			console.log(firebase.auth().currentUser);
			return groupCollection.doc("group1").collection("stories").add(story).then( () => {console.log("Added story via vuex")});
		}),

		updatePassageInStory: firestoreAction(( { state }, payload) => {
			let story = payload.story;
			let passageId = payload.passageId;
			let props = payload.props;

			if (!story){
				throw new Error("Unable to update passage: Story is undefined.");
			}

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (props.left && props.left < 0) {
				props.left = 0;
			}

			if (props.top && props.top < 0) {
				props.top = 0;
			}

			let passage;

			try {
				passage = getPassageInStory(story, passageId);
			} catch (e) {
				return;
			}

			Object.assign(passage, props);
			story.lastUpdate = new Date();
			return storyCollection.doc(story.id).set(story);
		}),

		deletePassageInStory: firestoreAction(({ state }, payload) => {
			let story = payload.story;
			let passageId = payload.passageId;
			if (!story){
				throw new Error("Unable to delete passage; story is undefined.");
			}

			story.passages = story.passages.filter(
				passage => passage.id !== passageId
			);
			firepadRef.child(story.id).child("passagetext").child(passageId).remove();
			story.lastUpdate = new Date();
			return storyCollection.doc(story.id).set(story);
		}),

		createPassageInStory: firestoreAction(({ state }, payload) => {
			console.log("Create passage in story story.js");
			let story = payload.story;
			let props = payload.props;
			/*
			uuid is used here as a salt so that passages always contain unique
			IDs in Electron (which otherwise uses deterministic IDs based on
			name provided), even if you rename one to a name a previous one used
			to have.
			*/

			if (!story){
				throw new Error("Creating passage failed; story undefined.");
			}
			let newPassage = Object.assign(
				{
					id: idFor(story.name + uuid())
				},
				storyStore.passageDefaults,
				props
			);

			/*
			Force the top and left properties to be at least zero, to keep
			passages onscreen.
			*/

			if (newPassage.left < 0) {
				newPassage.left = 0;
			}

			if (newPassage.top < 0) {
				newPassage.top = 0;
			}

			newPassage.story = story.id;
			story.passages.push(newPassage);

			if (story.passages.length === 1) {
				story.startPassage = newPassage.id;
			}

			story.lastUpdate = new Date();
			return storyCollection.doc(story.id).set(story);
		}),

		// Takes the passage text and assigns it to the RTDB.
		duplicatePassagesInStory: firestoreAction(({ state }, payload) => {
			console.log("Hi");
			const newStory = getStoryById(state, payload.newId);
			console.log(newStory);
			const Firepad = require('firepad');
			newStory.passages.forEach( individualPassage => {
				var storyRef = firepadRef.child(newStory.id).child("passagetext").child(individualPassage.id);
				var headless = new Firepad.Headless(storyRef);
				return headless.setText(individualPassage.text, (err, committed) => {
					if (err) {
						throw new Error ("Error in copying passage texts when duplicating.");
					}
					headless.dispose();
				})
			});
			var storyRef = firepadRef.child(newStory.id).child("stylesheet");
			var headless = new Firepad.Headless(storyRef);
			headless.setText(newStory.stylesheet, (err, committed) => {
				if (err) {
					throw new Error ("Error in copying stylesheet when duplicating story.");
				}
				headless.dispose();
			})
			storyRef = firepadRef.child(newStory.id).child("javascript");
			headless = new Firepad.Headless(storyRef);
			headless.setText(newStory.script, (err, committed) => {
				if (err) {
					throw new Error ("Error in copying stylesheet when duplicating story.");
				}
				headless.dispose();
			})
		})
	},

	getters: {
		stories: state => {
			return state.stories;
		},
		allStories: state => {
			return state.stories;
		},
		story: state => {
			return state.story;
		}
	},
	/* Defaults for newly-created objects. */

	storyDefaults: {
		name: locale.say('Untitled Story'),
		startPassage: -1,
		zoom: 1,
		snapToGrid: false,
		stylesheet: '',
		script: '',
		storyFormat: '',
		storyFormatVersion: ''
	},

	passageDefaults: {
		story: -1,
		top: 0,
		left: 0,
		width: 100,
		height: 100,
		tags: [],
		name: locale.say('Untitled Passage'),
		selected: false,

		text: ui.hasPrimaryTouchUI()
			? locale.say('Tap this passage, then the pencil icon to edit it.')
			: locale.say('Double-click this passage to edit it.')
	}
};
export default storyStore;
