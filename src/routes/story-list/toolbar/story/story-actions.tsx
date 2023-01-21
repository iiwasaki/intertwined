import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {RenameStoryButton} from '../../../../components/story/rename-story-button';
import {Story, updateStory, useStoriesContext} from '../../../../store/stories';
import {CreateStoryButton} from './create-story-button';
import {DeleteStoryButton} from './delete-story-button';
import {DuplicateStoryButton} from './duplicate-story-button';
import {EditStoryButton} from './edit-story-button';
import {TagStoryButton} from './tag-story-button';
import { usePrefsContext } from '../../../../store/prefs';
import { renameStoryFirebase } from '../../../../store/stories';
import { usePersistence } from '../../../../store/persistence/use-persistence';

export interface StoryActionsProps {
	selectedStory?: Story;
}

export const StoryActions: React.FC<StoryActionsProps> = props => {
	const {selectedStory} = props;
	const {prefs} = usePrefsContext();
	const {dispatch, stories} = useStoriesContext();
	const {stories: storiesPersistence} = usePersistence();

	return (
		<ButtonBar>
			<CreateStoryButton />
			<EditStoryButton story={selectedStory} />
			<TagStoryButton story={selectedStory} />
			<RenameStoryButton
				existingStories={stories}
				groupName={prefs.groupName}
				groupCode={prefs.groupCode}
				onRename={async function(name) {
					renameStoryFirebase(selectedStory, name, prefs.groupName, prefs.groupCode).then( async (result) => {
						if (result) {
							const newStories = await storiesPersistence.load(prefs.groupName, prefs.groupCode)
							dispatch({type: 'init', state: newStories})
						}
					})
				}}
				story={selectedStory}
			/>
			<DuplicateStoryButton story={selectedStory} />
			<DeleteStoryButton story={selectedStory} />
		</ButtonBar>
	);
};
