import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonBar} from '../../components/container/button-bar';
import {TagButton} from '../../components/tag';
import {
	Passage,
	removePassageTag,
	Story,
	updateStory
} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';
import { usePrefsContext } from '../../store/prefs';

export interface TagToolbarProps {
	passage: Passage;
	story: Story;
}

export const TagToolbar: React.FC<TagToolbarProps> = props => {
	const {passage, story} = props;
	const {dispatch, stories} = useUndoableStoriesContext();
	const {t} = useTranslation();
	const {prefs} = usePrefsContext();

	function handleChangeTagColor(name: string, color: Color) {
		dispatch(
			updateStory(stories, story, {
				tagColors: {...story.tagColors, [name]: color},
			}, prefs.groupName, prefs.groupCode)
		);
	}

	function handleRemoveTag(name: string) {
		dispatch(removePassageTag(story, passage, name, prefs.groupName, prefs.groupCode), t('undoChange.removeTag'));
	}

	if (passage.tags.length === 0) {
		return null;
	}

	return (
		<div className="tags">
			<ButtonBar>
				{passage.tags.map(tag => (
					<TagButton
						color={story.tagColors[tag]}
						key={tag}
						name={tag}
						onChangeColor={color => handleChangeTagColor(tag, color)}
						onRemove={() => handleRemoveTag(tag)}
					/>
				))}
			</ButtonBar>
		</div>
	);
};
