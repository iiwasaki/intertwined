/*
Top-level functions for publishing stories. Unlike the publish methods under
data/, these are Vuex-aware, work with IDs instead of direct data, and are
asynchronous.
*/

const {loadFormat} = require('../data/actions/story-format');
const locale = require('../locale');
const {publishStoryWithFormat} = require('../data/publish');
const FirebaseHandler = require('../data/firebase-handler').default;

module.exports = {
	async getStoryPlayHtml(store, storyId) {
		const story = await FirebaseHandler.loadStoryById(storyId);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}
		console.log("Format version update: ", story);
		return loadFormat(
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

		return loadFormat(
			store,
			store.state.pref.proofingFormat.name,
			store.state.pref.proofingFormat.version
		).then(format =>
			publishStoryWithFormat(store.state.appInfo, story, format)
		);
	},

	async getStoryTestHtml(store, storyId, startPassageId) {
		const story = await FirebaseHandler.loadStoryById(storyId);

		if (!story) {
			throw new Error(
				locale.say('There is no story with ID %s.', storyId)
			);
		}

		return loadFormat(
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
