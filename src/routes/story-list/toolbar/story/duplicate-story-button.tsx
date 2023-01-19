import {IconCopy} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	duplicateStory,
	Story,
	useStoriesContext
} from '../../../../store/stories';
import { usePrefsContext } from '../../../../store/prefs';

export interface DuplicateStoryButtonProps {
	story?: Story;
}

export const DuplicateStoryButton: React.FC<DuplicateStoryButtonProps> = ({
	story
}) => {
	const {dispatch, stories} = useStoriesContext();
	const {t} = useTranslation();
	const {prefs} = usePrefsContext();

	function handleClick() {
		if (!story) {
			throw new Error('No story set');
		}

		dispatch(duplicateStory(story, stories, prefs.groupName, prefs.groupCode));
	}

	return (
		<IconButton
			disabled={!story}
			icon={<IconCopy />}
			label={t('common.duplicate')}
			onClick={handleClick}
		/>
	);
};
