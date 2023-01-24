import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
//import {RenameStoryButton} from '../../../../components/story/rename-story-button';
import {Story} from '../../../../store/stories';
import {DetailsButton} from './details-button';
import {FindReplaceButton} from './find-replace-button';
import {JavaScriptButton} from './javascript-button';
import {PassageTagsButton} from './passage-tags-button';
import {StylesheetButton} from './stylesheet-button';
//import { usePrefsContext } from '../../../../store/prefs';
//import { renameStoryFirebase } from '../../../../store/stories';
//import { usePersistence } from '../../../../store/persistence/use-persistence';

export interface StoryActionsProps {
	story: Story;
}

export const StoryActions: React.FC<StoryActionsProps> = props => {
	//const {dispatch, stories} = useStoriesContext();
	//const {prefs} = usePrefsContext();
	const {story} = props;
	//const {stories: storiesPersistence} = usePersistence();

	return (
		<ButtonBar>
			<FindReplaceButton story={story} />
			{/* Rename story button temporarily disabled from this window - the desync when the original story is deleted is not worth it right now.
			<RenameStoryButton
				existingStories={stories}
				onRename={
					async function(name) {
						renameStoryFirebase(story, name, prefs.groupName, prefs.groupCode).then( async (result) => {
							if (result) {
								const newStories = await storiesPersistence.load(prefs.groupName, prefs.groupCode)
								dispatch({type: 'init', state: newStories})
							}
						})
					}
				}
				story={story}
				groupName={prefs.groupName}
				groupCode={prefs.groupCode}
			/>*/}
			<DetailsButton story={story} />
			<PassageTagsButton story={story} />
			<JavaScriptButton story={story} />
			<StylesheetButton story={story} />
		</ButtonBar>
	);
};
