import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {RenameStoryButton} from '../../../../components/story/rename-story-button';
import {Story, useStoriesContext} from '../../../../store/stories';
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


/*
like some people don't want to RP with an Asian girl and I've had experiences where if I didn't mention it, and it got time to like discuss who we are and stuff and I'd offer a reference for myself they would be like "Oh I don't like Asian girls sorry" or something and so I just figured I'd avoid that from the start by saying that I was Asian!
*/