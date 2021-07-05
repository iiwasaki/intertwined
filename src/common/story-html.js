/*
Top-level functions for publishing stories. Unlike the publish methods under
data/, these are Vuex-aware, work with IDs instead of direct data, and are
asynchronous.
*/

import formatActions from '../data/actions/story-format';
import locale from '../locale';
const {publishStoryWithFormat} = require('../data/publish');
import FirebaseHandler from '../data/firebase-handler';

export default {
	async getStoryPlayHtml(store, storyId) {
		const story = await FirebaseHandler.loadStoryById(storyId);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}
		console.log("Format version update: ", story);
		return formatActions.loadFormat(
			store,
			story.storyFormat,
			story.storyFormatVersion
		).then(format =>
			publishStoryWithFormat(store.state.appInfo, story, format)
		);
	},

	async getStoryProofingHtml(store, storyId) {
		const story = await FirebaseHandler.loadStoryById(storyId);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return formatActions.loadFormat(
			store,
			store.state.pref.proofingFormat.name,
			store.state.pref.proofingFormat.version
		).then(format =>
			publishStoryWithFormat(store.state.appInfo, story, format)
		);
	},

	async getStoryTestHtml(store, storyId, startPassageId) {
		console.log("stody Id is " + storyId);
		const story = await FirebaseHandler.loadStoryById(storyId);

		console.log(story);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return formatActions.loadFormat(
			store,
			story.storyFormat,
			story.storyFormatVersion
		).then(format =>
			publishStoryWithFormat(
				store.state.appInfo,
				story,
				format,
				['debug'],
				startPassageId
			)
		);
	}
};
