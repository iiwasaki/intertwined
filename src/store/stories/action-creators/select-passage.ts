import {Thunk} from 'react-hook-thunk-reducer';
import {Rect, rectsIntersect} from '../../../util/geometry';
import {
	Passage,
	StoriesState,
	Story,
	UpdatePassageAction,
	UpdatePassagesAction
} from '../stories.types';

/**
 * Deselects all passages.
 */
export function deselectAllPassages(
	story: Story,
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdatePassagesAction> {
	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		story.passages.forEach(passage => {
			if (passage.selected) {
				passageUpdates[passage.id] = {selected: false};
			}
		});

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({
				passageUpdates,
				type: 'updatePassages',
				storyId: story.id,
				groupName: groupName,
				groupCode: groupCode
			});
		}
	};
}

/**
 * Deselects a single passage.
 */
export function deselectPassage(
	story: Story,
	passage: Passage,
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdatePassageAction> {
	if (passage.story !== story.id) {
		throw new Error('This passage does not belong to this story');
	}

	return dispatch => {
		if (passage.selected) {
			dispatch({
				type: 'updatePassage',
				passageId: passage.id,
				props: {selected: false},
				storyId: story.id,
				groupName: groupName,
				groupCode: groupCode
			});
		}
	};
}

/**
 * Selects all passages.
 */
export function selectAllPassages(
	story: Story,
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdatePassagesAction> {
	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		story.passages.forEach(passage => {
			if (!passage.selected) {
				passageUpdates[passage.id] = {selected: true};
			}
		});

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({
				passageUpdates,
				type: 'updatePassages',
				storyId: story.id,
				groupName: groupName,
				groupCode: groupCode
			});
		}
	};
}

/**
 * Selects a single passage.
 */
export function selectPassage(
	story: Story,
	passage: Passage,
	exclusive: boolean,
	groupName: string,
	groupCode: string,
): Thunk<StoriesState, UpdatePassagesAction> {
	if (passage.story !== story.id) {
		throw new Error('This passage does not belong to this story');
	}

	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		if (!passage.selected) {
			passageUpdates[passage.id] = {selected: true};
		}

		if (exclusive) {
			story.passages.forEach(p => {
				if (p.id !== passage.id && p.selected) {
					passageUpdates[p.id] = {selected: false};
				}
			});
		}

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({type: 'updatePassages', passageUpdates, storyId: story.id, groupName: groupName, groupCode: groupCode});
		}
	};
}

export function selectPassagesInRect(
	story: Story,
	rect: Rect,
	ignoreIds: string[] = [],
	groupName: string,
	groupCode: string
): Thunk<StoriesState, UpdatePassagesAction> {
	return dispatch => {
		const passageUpdates: Record<string, Partial<Passage>> = {};

		story.passages.forEach(passage => {
			if (ignoreIds.find(r => r === passage.id)) {
				// We are ignoring this passage, e.g. this is an additive selection and it
				// was already selected.
				return;
			}

			const selected = rectsIntersect(rect, passage);

			if (passage.selected !== selected) {
				passageUpdates[passage.id] = {selected};
			}
		});

		if (Object.keys(passageUpdates).length > 0) {
			dispatch({type: 'updatePassages', passageUpdates, storyId: story.id, groupName: groupName, groupCode: groupCode});
		}
	};
}
