import {IconMarquee} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {
	selectAllPassages,
	Story,
	useStoriesContext
} from '../../../../store/stories';
import { usePrefsContext } from '../../../../store/prefs';

export interface SelectAllPassagesButtonProps {
	story: Story;
}

export const SelectAllPassagesButton: React.FC<SelectAllPassagesButtonProps> = props => {
	const {story} = props;
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();
	const {prefs} = usePrefsContext();

	return (
		<IconButton
			icon={<IconMarquee />}
			label={t('common.selectAll')}
			onClick={() => dispatch(selectAllPassages(story, prefs.groupName, prefs.groupCode))}
		/>
	);
};
