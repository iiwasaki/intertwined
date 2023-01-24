import {StoriesState, Passage} from '../stories.types';

export function clearState(
	state: StoriesState,
	storyId: string,
) {
	let foundStory = false;

	const newState = state.map(story => {
		if (story.id !== storyId) {
			return story;
		}

		foundStory = true;

		const newStory = {
			...story,
			passages: [] as Passage[]
		};

		return newStory;
	});

	if (!foundStory) {
		console.warn(`No story in state with ID "${storyId}", taking no action`);
		return state;
	}

	return newState;
}
