import {Thunk} from 'react-hook-thunk-reducer';
import {StoriesState, Story, UpdateStoryAction} from '../stories.types';

/**
 * Deselects a single story.
 */
export function deselectStory(
	story: Story,
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdateStoryAction> {
	return (dispatch, getState) => {
		if (!story.selected) {
			dispatch({
				type: 'updateStory',
				storyId: story.id,
				props: {selected: false},
				groupName: groupName,
				groupCode: groupCode
			});
		}
	};
}

/**
 * Deselects all stories.
 */
export function deselectAllStories(
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdateStoryAction> {
	return (dispatch, getState) => {
		for (const story of getState()) {
			if (story.selected) {
				dispatch({
					type: 'updateStory',
					storyId: story.id,
					props: {selected: false},
					groupName: groupName,
					groupCode: groupCode,
				});
			}
		}
	};
}

/**
 * Selects a single story.
 */
export function selectStory(
	story: Story,
	exclusive: boolean,
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdateStoryAction> {
	return (dispatch, getState) => {
		if (!story.selected) {
			dispatch({
				type: 'updateStory',
				storyId: story.id,
				props: {selected: true},
				groupName: groupName,
				groupCode: groupCode
			});
		}

		if (exclusive) {
			for (const other of getState()) {
				if (other.id !== story.id && other.selected) {
					dispatch({
						type: 'updateStory',
						storyId: other.id,
						props: {selected: false},
						groupName: groupName,
						groupCode: groupCode
					});
				}
			}
		}
	};
}
