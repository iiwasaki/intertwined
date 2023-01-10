import {Story, StoriesState} from '../stories.types';

export function syncStories(state: StoriesState, newState: Story[]) {
	console.log("In syncstate")
    console.log(newState)
	return [...newState];
}
