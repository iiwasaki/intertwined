import {repairStory} from './repair-story';
import {StoryFormat} from '../../../story-formats';
import {StoriesState} from '../../stories.types';

export function repairState(
	state: StoriesState,
	allFormats: StoryFormat[],
	defaultFormat: StoryFormat,
	groupName: string,
	groupCode: string
): StoriesState {
	return state.map(story =>
		repairStory(story, state, allFormats, defaultFormat, groupName, groupCode)
	);
}
