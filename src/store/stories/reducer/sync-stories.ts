import {Story, StoriesState} from '../stories.types';

export function syncStories(state: StoriesState, newState: Story[]) {
	return [...newState];
}
