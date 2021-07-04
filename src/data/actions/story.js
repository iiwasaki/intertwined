/*
Story-related actions.
*/

import semverUtils from 'semver-utils';
import latestFormatVersions from '../latest-format-versions';

export default {
	createStory(store, props) {
		let normalizedProps = Object.assign({}, props);

		/* If a format isn't specified, use the default one. */

		if (!normalizedProps.storyFormat) {
			normalizedProps.storyFormat = store.state.pref.defaultFormat.name;
			normalizedProps.storyFormatVersion =
				store.state.pref.defaultFormat.version;
		}

		store.dispatch('createStory', normalizedProps);
	},

	updateStory(store, id, props) {
		store.dispatch('updateStory',
		{
			id: id,
			props: props
		});
	},

	deleteStory(store, id) {
		store.dispatch('deleteStory',id);
	},

	duplicateStory(store, id, newName) {
		store.dispatch('duplicateStory', {
			id: id,
			newName: newName
		});
	},

	importStory(store, toImport) {
		store.commit('IMPORT_STORY', {
			toImport: toImport,
		});
	},

	setTagColorInStory(store, storyId, tagName, tagColor) {
		const story = store.state.story.stories.find(
			story => story.id == storyId
		);
		let toMerge = {};

		toMerge[tagName] = tagColor;

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		store.commit('UPDATE_STORY', storyId, {
			tagColors: Object.assign({}, story.tagColors, toMerge)
		});
	},

	/*
	Removes any unused tag colors from a story.
	*/

	cleanUpTagColorsInStory(store, storyId) {
		let story = store.state.story.stories.find(
			story => story.id == storyId
		);
		let tagColors = Object.assign({}, story.tagColors);

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		Object.keys(tagColors).forEach(tag => {
			if (story.passages.some(p => p.tags.indexOf(tag) !== -1)) {
				return;
			}

			delete tagColors[tag];
		});

		store.dispatch('UPDATE_STORY', storyId, {tagColors});
	},

	/*
	Repairs stories by ensuring that they always have a story format and
	version set.
	*/

	repairStories(store) {
		const latestVersions = latestFormatVersions(store);

		store.state.story.stories.forEach(story => {
			/*
			Reset stories without any story format.
			*/

			if (!story.storyFormat) {
				actions.updateStory(store, story.id, {
					storyFormat: store.state.pref.defaultFormat.name
				});
			}

			/*
			Coerce old SugarCube formats, which had version numbers in their
			name, to the correct built-in ones.
			*/

			if (/^SugarCube 1/.test(story.storyFormat)) {
				actions.updateStory(store, story.id, {
					storyFormat: 'SugarCube',
					storyFormatVersion: latestVersions['SugarCube']['1'].version
				});
			} else if (/^SugarCube 2/.test(story.storyFormat)) {
				actions.updateStory(store, story.id, {
					storyFormat: 'SugarCube',
					storyFormatVersion: latestVersions['SugarCube']['2'].version
				});
			}

			if (story.storyFormatVersion) {
				/*
				Update the story's story format to the latest available version.
				*/

				const majorVersion = semverUtils.parse(story.storyFormatVersion)
					.major;

				/* eslint-disable max-len */

				if (
					latestVersions[story.storyFormat] &&
					latestVersions[story.storyFormat][majorVersion] &&
					story.storyFormatVersion !==
						latestVersions[story.storyFormat][majorVersion].version
				) {
					actions.updateStory(store, story.id, {
						storyFormatVersion:
							latestVersions[story.storyFormat][majorVersion]
								.version
					});
				}

				/* eslint-enable max-len */
			} else if (latestVersions[story.storyFormat]) {
				/*
				If a story has no format version, pick the lowest major version
				number currently available.
				*/

				const majorVersion = Object.keys(
					latestVersions[story.storyFormat]
				).reduce((prev, current) => (current < prev ? current : prev));

				actions.updateStory(store, story.id, {
					/* eslint-disable max-len */
					storyFormatVersion:
						latestVersions[story.storyFormat][majorVersion].version
					/* eslint-enable max-len */
				});
			}
		});
	}
};
