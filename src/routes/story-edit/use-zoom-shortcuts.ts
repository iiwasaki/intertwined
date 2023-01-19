import {useHotkeys} from 'react-hotkeys-hook';
import {Story, updateStory, useStoriesContext} from '../../store/stories';
import { usePrefsContext } from '../../store/prefs';

export function useZoomShortcuts(story: Story) {
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();

	useHotkeys(
		'-',
		() => {
			switch (story.zoom) {
				case 1:
					dispatch(updateStory(stories, story, {zoom: 0.6}, prefs.groupName, prefs.groupCode));
					break;
				case 0.6:
					dispatch(updateStory(stories, story, {zoom: 0.3}, prefs.groupName, prefs.groupCode));
					break;
				// Do nothing if zoom is 0.3
			}
		},
		{keydown: false, keyup: true},
		[dispatch, stories, story]
	);
	useHotkeys(
		'=',
		() => {
			switch (story.zoom) {
				case 0.3:
					dispatch(updateStory(stories, story, {zoom: 0.6}, prefs.groupName, prefs.groupCode));
					break;
				case 0.6:
					dispatch(updateStory(stories, story, {zoom: 1}, prefs.groupName, prefs.groupCode));
					break;
				// Do nothing if zoom is 1
			}
		},
		{keydown: false, keyup: true},
		[dispatch, stories, story]
	);
}
