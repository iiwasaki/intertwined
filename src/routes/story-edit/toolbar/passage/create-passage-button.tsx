import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconPlus} from '@tabler/icons';
import {IconButton} from '../../../../components/control/icon-button';
import {createUntitledPassage, Story} from '../../../../store/stories';
import {useUndoableStoriesContext} from '../../../../store/undoable-stories';
import {Point} from '../../../../util/geometry';
import { usePrefsContext } from '../../../../store/prefs';

export interface CreatePassageButtonProps {
	getCenter: () => Point;
	story: Story;
}

export const CreatePassageButton: React.FC<CreatePassageButtonProps> = props => {
	const {getCenter, story} = props;
	const {prefs} = usePrefsContext();
	const {dispatch} = useUndoableStoriesContext();
	const handleClick = React.useCallback(() => {
		const {left, top} = getCenter();

		dispatch(createUntitledPassage(story, left, top, prefs.groupName, prefs.groupCode), 'undoChange.newPassage');
	}, [dispatch, getCenter, story, prefs.groupName, prefs.groupCode]);
	const {t} = useTranslation();

	return (
		<IconButton
			icon={<IconPlus />}
			label={t('common.new')}
			onClick={handleClick}
		/>
	);
};
