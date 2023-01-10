import {Story, StoriesState} from '../stories.types';

export function initState(state: StoriesState, init: Story[]) {
	console.log("In initstate")
	console.log(init)
	return [...init];
}
